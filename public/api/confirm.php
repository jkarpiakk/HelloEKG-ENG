<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');
$site = rtrim((string) cfg('site_url'), '/');

try {
    $token = (string) ($_GET['t'] ?? '');
    if (!preg_match('/^[a-f0-9]{32}$/', $token)) {
        header('Location: ' . $site . '/signup-error', true, 303);
        exit;
    }
    $tokenHash = hash('sha256', $token);
    $t = read_json(token_file($tokenHash));
    $sub = $t ? read_json(sub_file((string) $t['key'])) : null;

    // Clicking the link twice (or from a second device) is fine.
    if ($sub && ($sub['status'] ?? '') === 'confirmed') {
        header('Location: ' . $site . '/confirmed', true, 303);
        exit;
    }
    if (!$t || !$sub || !empty($t['used_at']) || strtotime($t['created_at'] ?? '1970-01-01') < time() - 86400 * (int) cfg('pending_days')) {
        header('Location: ' . $site . '/signup-error', true, 303);
        exit;
    }

    $sub['status'] = 'confirmed';
    $sub['confirmed_at'] = now();
    $sub['confirm_ip_hash'] = ip_hash();
    unset($sub['token_hash']);
    write_json(sub_file((string) $t['key']), $sub);
    // Keep the used token until housekeeping so a second click lands on /confirmed.
    $t['used_at'] = now();
    write_json(token_file($tokenHash), $t);

    $notify = (string) cfg('notify_email');
    if ($notify !== '' && filter_var($notify, FILTER_VALIDATE_EMAIL)) {
        $line = sprintf("New confirmed subscriber (EN)\nsource: %s\nscore: %s\ntime: %s\n", $sub['source'] ?? '', $sub['score'] ?? '', $sub['confirmed_at']);
        send_mail($notify, 'helloEKG EN: +1 subscriber', $line, nl2br(htmlspecialchars($line, ENT_QUOTES, 'UTF-8')));
    }

    header('Location: ' . $site . '/confirmed', true, 303);
} catch (Throwable $e) {
    error_log('helloEKG confirm: ' . $e->getMessage());
    header('Location: ' . $site . '/signup-error', true, 303);
}
