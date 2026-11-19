<?php
/**
 * Built-in PHP Development Server Router
 * Usage: php -S 127.0.0.1:8080 router.php
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

if ($uri === '/' || $uri === '') {
    include __DIR__ . '/index.html';
    return true;
}

$file = __DIR__ . $uri;

if (file_exists($file) && !is_dir($file)) {
    return false; // Serve static file directly
}

if (file_exists($file . '.php')) {
    include $file . '.php';
    return true;
}

if (file_exists($file . '.html')) {
    include $file . '.html';
    return true;
}

http_response_code(404);
echo "404 Not Found";
return true;

