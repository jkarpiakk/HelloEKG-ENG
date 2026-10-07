<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method'], '/');
}

try {
    $in = request_data();

    // Bots: honeypot filled or form submitted faster than a human can type.
    // Pretend success so they learn nothing.
    $elapsed = isset($in['t']) ? (int) $in['t'] : null;
    if (!empty($in['website']) || ($elapsed !== null && $elapsed < 1500)) {
        respond(200, ['ok' => true, 'status' => 'pending'], '/check-inbox');
    }

    $email = strtolower(trim((string) ($in['email'] ?? '')));
    if ($email === '' || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(422, ['ok' => false, 'error' => 'invalid'], '/signup-error');
    }
    $source = substr(preg_replace('/[^a-z0-9-]/', '', strtolower((string) ($in['source'] ?? ''))), 0, 40);
    $score = preg_match('~^\d{1,2}/\d{1,2}$~', (string) ($in['score'] ?? '')) ? (string) $in['score'] : '';

    if (rate_limited()) {
        respond(429, ['ok' => false, 'error' => 'rate'], '/signup-error');
    }
    housekeeping();

    $key = email_key($email);
    $sub = read_json(sub_file($key));

    if ($sub && ($sub['status'] ?? '') === 'confirmed') {
        respond(200, ['ok' => true, 'status' => 'confirmed'], '/confirmed');
    }
    // Pending and we sent a link less than 2 minutes ago: don't spam the inbox.
    if ($sub && ($sub['status'] ?? '') === 'pending' && strtotime($sub['sent_at'] ?? '1970-01-01') > time() - 120) {
        respond(200, ['ok' => true, 'status' => 'pending'], '/check-inbox');
    }

    if ($sub && !empty($sub['token_hash'])) {
        @unlink(token_file($sub['token_hash']));
    }
    $token = bin2hex(random_bytes(16));
    $tokenHash = hash('sha256', $token);

    $sub = array_merge($sub ?? ['created_at' => now()], [
        'email'      => $email,
        'status'     => 'pending',
        'lang'       => 'en',
        'source'     => $source,
        'score'      => $score,
        'consent'    => 'Weekly ECG case and helloEKG news (English edition early access). Privacy: /privacy',
        'ip_hash'    => ip_hash(),
        'user_agent' => substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 200),
        'token_hash' => $tokenHash,
        'sent_at'    => now(),
    ]);
    write_json(sub_file($key), $sub);
    write_json(token_file($tokenHash), ['key' => $key, 'created_at' => now()]);

    $link = rtrim((string) cfg('site_url'), '/') . '/api/confirm.php?t=' . $token;
    $text = "One click and you're in.\n\n"
        . "Confirm your address to get one ECG case every Tuesday and early access to the English edition of helloEKG:\n\n"
        . $link . "\n\n"
        . "Didn't sign up? Ignore this email — without the click you won't hear from us again.\n\n"
        . "— helloEKG\nThe online ECG course that teaches you why.\n" . cfg('site_url') . "\n";
    $html = email_html(
        'Confirm your email',
        'One click and you are in: one ECG case every Tuesday, and early access to the English edition of helloEKG.',
        'Confirm my email',
        $link,
        'Did not sign up? Ignore this email — without the click you will not hear from us again.'
    );
    if (!send_mail($email, 'Confirm your email — helloEKG', $text, $html)) {
        error_log('helloEKG: mail() failed for subscription');
        respond(502, ['ok' => false, 'error' => 'mail'], '/signup-error');
    }

    respond(200, ['ok' => true, 'status' => 'pending'], '/check-inbox');
} catch (Throwable $e) {
    error_log('helloEKG subscribe: ' . $e->getMessage());
    respond(500, ['ok' => false, 'error' => 'server'], '/signup-error');
}
