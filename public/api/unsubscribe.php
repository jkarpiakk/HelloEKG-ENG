<?php
// GET  /api/unsubscribe.php?k=…&s=…  → marks the address unsubscribed, redirects
// POST same URL (RFC 8058 one-click, "List-Unsubscribe=One-Click") → 200
declare(strict_types=1);
require __DIR__ . '/_lib.php';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');
$site = rtrim((string) cfg('site_url'), '/');
$key = (string) ($_GET['k'] ?? '');
$sig = (string) ($_GET['s'] ?? '');
$isPost = ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST';

try {
    if (!preg_match('/^[a-f0-9]{64}$/', $key) || !preg_match('/^[a-f0-9]{24}$/', $sig) || !valid_unsub_sig($key, $sig)) {
        if ($isPost) {
            http_response_code(400);
            exit;
        }
        header('Location: ' . $site . '/signup-error', true, 303);
        exit;
    }
    $sub = read_json(sub_file($key));
    if ($sub) {
        // Keep only what is needed to honour the opt-out.
        write_json(sub_file($key), [
            'email'           => $sub['email'] ?? '',
            'status'          => 'unsubscribed',
            'created_at'      => $sub['created_at'] ?? null,
            'unsubscribed_at' => now(),
        ]);
    }
    if ($isPost) {
        http_response_code(200);
        exit;
    }
    header('Location: ' . $site . '/unsubscribed', true, 303);
} catch (Throwable $e) {
    error_log('helloEKG unsubscribe: ' . $e->getMessage());
    if ($isPost) {
        http_response_code(500);
        exit;
    }
    header('Location: ' . $site . '/signup-error', true, 303);
}
