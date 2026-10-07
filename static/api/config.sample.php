<?php
// Copy to api/config.php on the server (it is never served over HTTP and is
// not committed). Every key is optional; defaults live in _lib.php.
return [
    'from_email'   => 'hello@helloekg.com',
    'from_name'    => 'helloEKG',
    'notify_email' => '',
    // 32+ random characters, e.g. `openssl rand -hex 24`
    'export_key'   => '',
];
