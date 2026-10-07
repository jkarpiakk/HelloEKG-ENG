<?php
// helloEKG — email list backend for shared hosting (home.pl).
// No database: one JSON file per subscriber in api/_data (denied over HTTP).
// Double opt-in: subscribe.php → email with link → confirm.php.
declare(strict_types=1);

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === '_lib.php') {
    http_response_code(404);
    exit;
}

$CONFIG = [
    'site_url'     => 'https://helloekg.com',
    'from_email'   => 'hello@helloekg.com', // must be a mailbox on this domain (home.pl panel → Poczta)
    'from_name'    => 'helloEKG',
    'notify_email' => '',                   // optional: receive a note for every confirmed signup
    'export_key'   => '',                   // set a long random string to enable export.php
    'data_dir'     => __DIR__ . '/_data',
    'rate_limit'   => 6,                    // signups per IP per hour
    'pending_days' => 30,                   // unconfirmed addresses are deleted after this
];
if (is_file(__DIR__ . '/config.php')) {
    $CONFIG = array_merge($CONFIG, (array) require __DIR__ . '/config.php');
}

function cfg(string $k)
{
    global $CONFIG;
    return $CONFIG[$k] ?? null;
}

function data_dir(string $sub = ''): string
{
    $dir = rtrim((string) cfg('data_dir'), '/') . ($sub !== '' ? '/' . $sub : '');
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    return $dir;
}

function secret(): string
{
    static $s = null;
    if ($s !== null) {
        return $s;
    }
    $f = data_dir() . '/secret.php';
    if (!is_file($f)) {
        @file_put_contents($f, GUARD . bin2hex(random_bytes(32)), LOCK_EX);
        @chmod($f, 0640);
    }
    $s = trim(str_replace(GUARD, '', (string) @file_get_contents($f)));
    if ($s === '') {
        throw new RuntimeException('secret');
    }
    return $s;
}

function email_key(string $email): string
{
    return hash_hmac('sha256', 'email:' . $email, secret());
}

function ip_hash(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    return substr(hash_hmac('sha256', 'ip:' . $ip, secret()), 0, 32);
}

// Data files are .php with an exit guard, so even if .htaccess were ignored
// (e.g. a host without AllowOverride) requesting them returns nothing.
const GUARD = "<?php exit; ?>\n";

function read_json(string $file): ?array
{
    if (!is_file($file)) {
        return null;
    }
    $raw = @file_get_contents($file);
    if ($raw !== false && strncmp($raw, GUARD, strlen(GUARD)) === 0) {
        $raw = substr($raw, strlen(GUARD));
    }
    $data = $raw === false ? null : json_decode($raw, true);
    return is_array($data) ? $data : null;
}

function write_json(string $file, array $data): void
{
    $tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp.php';
    if (@file_put_contents($tmp, GUARD . json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) === false) {
        throw new RuntimeException('write');
    }
    @chmod($tmp, 0640);
    if (!@rename($tmp, $file)) {
        @unlink($tmp);
        throw new RuntimeException('write');
    }
}

function sub_file(string $key): string
{
    return data_dir('subs') . '/' . $key . '.php';
}

function token_file(string $tokenHash): string
{
    return data_dir('tokens') . '/' . $tokenHash . '.php';
}

function now(): string
{
    return gmdate('Y-m-d\TH:i:s\Z');
}

// Sliding window: max N requests per IP per hour.
function rate_limited(): bool
{
    $f = data_dir('rl') . '/' . ip_hash() . '.php';
    $hits = array_values(array_filter(read_json($f) ?? [], fn ($t) => is_int($t) && $t > time() - 3600));
    if (count($hits) >= (int) cfg('rate_limit')) {
        return true;
    }
    $hits[] = time();
    write_json($f, $hits);
    return false;
}

// Occasionally delete expired confirmation tokens, pending subscribers and
// rate-limit files.
function housekeeping(): void
{
    if (random_int(1, 40) !== 1) {
        return;
    }
    $cut = time() - 86400 * (int) cfg('pending_days');
    foreach (glob(data_dir('tokens') . '/*.php') ?: [] as $f) {
        $t = read_json($f);
        if (!$t || strtotime($t['created_at'] ?? '1970-01-01') < $cut) {
            if ($t && !empty($t['key'])) {
                $s = read_json(sub_file($t['key']));
                if ($s && ($s['status'] ?? '') === 'pending') {
                    @unlink(sub_file($t['key']));
                }
            }
            @unlink($f);
        }
    }
    foreach (glob(data_dir('rl') . '/*.php') ?: [] as $f) {
        if (filemtime($f) < time() - 3600) {
            @unlink($f);
        }
    }
}

function request_data(): array
{
    $type = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($type, 'application/json') !== false) {
        $raw = file_get_contents('php://input', false, null, 0, 8192);
        $d = json_decode((string) $raw, true);
        return is_array($d) ? $d : [];
    }
    return $_POST;
}

function wants_json(): bool
{
    return stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false
        || stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false;
}

function respond(int $code, array $json, string $redirect): void
{
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    if (wants_json()) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($json);
    } else {
        header('Location: ' . rtrim((string) cfg('site_url'), '/') . $redirect, true, 303);
    }
    exit;
}

function unsubscribe_url(string $key): string
{
    $sig = substr(hash_hmac('sha256', 'unsub:' . $key, secret()), 0, 24);
    return rtrim((string) cfg('site_url'), '/') . '/api/unsubscribe.php?k=' . $key . '&s=' . $sig;
}

function valid_unsub_sig(string $key, string $sig): bool
{
    return hash_equals(substr(hash_hmac('sha256', 'unsub:' . $key, secret()), 0, 24), $sig);
}

function send_mail(string $to, string $subject, string $text, string $html, array $extraHeaders = []): bool
{
    $from = (string) cfg('from_email');
    $name = (string) cfg('from_name');
    $boundary = 'hekg_' . bin2hex(random_bytes(8));
    $headers = array_merge([
        'From: ' . mb_encode_mimeheader($name, 'UTF-8') . ' <' . $from . '>',
        'Reply-To: ' . $from,
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
        'X-Mailer: helloEKG',
    ], $extraHeaders);
    $body = "--$boundary\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n"
        . $text . "\r\n"
        . "--$boundary\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n"
        . $html . "\r\n"
        . "--$boundary--\r\n";
    $params = filter_var($from, FILTER_VALIDATE_EMAIL) ? '-f' . $from : '';
    return @mail($to, mb_encode_mimeheader($subject, 'UTF-8'), $body, implode("\r\n", $headers), $params);
}

function email_html(string $title, string $intro, string $button, string $url, string $outro): string
{
    $e = fn ($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
    $site = $e((string) cfg('site_url'));
    return '<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#F8FAF9;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAF9;padding:32px 16px;"><tr><td align="center">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid #E2E8E5;border-radius:14px;">'
        . '<tr><td style="padding:32px 32px 8px;font:500 20px/1.2 Helvetica,Arial,sans-serif;color:#0C1210;">hello<b>EKG</b></td></tr>'
        . '<tr><td style="padding:8px 32px 0;font:500 24px/1.25 Helvetica,Arial,sans-serif;color:#0C1210;">' . $e($title) . '</td></tr>'
        . '<tr><td style="padding:12px 32px 0;font:400 16px/1.6 Helvetica,Arial,sans-serif;color:#33413C;">' . $e($intro) . '</td></tr>'
        . '<tr><td style="padding:24px 32px;"><a href="' . $e($url) . '" style="display:inline-block;background:#3EE6A8;color:#07130E;text-decoration:none;font:600 15px/1 Helvetica,Arial,sans-serif;padding:15px 26px;border-radius:999px;">' . $e($button) . '</a></td></tr>'
        . '<tr><td style="padding:0 32px 24px;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#5C6870;">' . $e($outro) . '<br><br>Or paste this link into your browser:<br><span style="word-break:break-all;color:#0B7E54;">' . $e($url) . '</span></td></tr>'
        . '<tr><td style="padding:16px 32px 28px;border-top:1px solid #E2E8E5;font:400 12px/1.6 Helvetica,Arial,sans-serif;color:#5C6870;">helloEKG — the online ECG course that teaches you why.<br><a href="' . $site . '" style="color:#0B7E54;">' . $site . '</a></td></tr>'
        . '</table></td></tr></table></body></html>';
}
