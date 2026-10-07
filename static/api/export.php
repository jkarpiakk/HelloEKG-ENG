<?php
// CSV export of the list, e.g. to import into MailerLite / Brevo / Mailchimp.
// Enable by setting 'export_key' in api/config.php, then:
//   curl -H "X-Export-Key: <key>" https://helloekg.com/api/export.php > list.csv
// ?all=1 includes pending and unsubscribed rows (default: confirmed only).
declare(strict_types=1);
require __DIR__ . '/_lib.php';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');
$expected = (string) cfg('export_key');
$given = (string) ($_SERVER['HTTP_X_EXPORT_KEY'] ?? '');
if (strlen($expected) < 24 || !hash_equals($expected, $given)) {
    http_response_code(404);
    exit;
}

$all = isset($_GET['all']);
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="helloekg-en-' . gmdate('Y-m-d') . '.csv"');
$out = fopen('php://output', 'w');
fputcsv($out, ['email', 'status', 'created_at', 'confirmed_at', 'source', 'score', 'unsubscribe_url']);
foreach (glob(data_dir('subs') . '/*.php') ?: [] as $f) {
    $s = read_json($f);
    if (!$s || (!$all && ($s['status'] ?? '') !== 'confirmed')) {
        continue;
    }
    $key = basename($f, '.php');
    fputcsv($out, [
        $s['email'] ?? '',
        $s['status'] ?? '',
        $s['created_at'] ?? '',
        $s['confirmed_at'] ?? '',
        $s['source'] ?? '',
        $s['score'] ?? '',
        unsubscribe_url($key),
    ]);
}
fclose($out);
