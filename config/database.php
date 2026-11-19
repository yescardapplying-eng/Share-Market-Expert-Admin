<?php
/**
 * ============================================================================
 * SHARE MARKET EXPERT ADMIN — DATABASE CONNECTION MODULE
 * Timezone: Asia/Kolkata (IST)
 * Compatible with Hostinger MySQL, TiDB Cloud, and Localhost
 * ============================================================================
 */

// Set default timezone to Indian Standard Time (Asia/Kolkata)
date_default_timezone_set('Asia/Kolkata');

function loadAdminEnv($file = null) {
    if ($file === null) {
        $file = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
    }
    if (!file_exists($file)) {
        return;
    }

    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) {
            continue;
        }

        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);

            // Strip surrounding quotes
            if (preg_match('/^"(.+)"$/', $value, $matches) || preg_match("/^'(.+)'$/", $value, $matches)) {
                $value = $matches[1];
            }

            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

loadAdminEnv();

function getAdminDB() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    loadAdminEnv();

    $host = getenv('DB_HOST') ?: 'localhost';
    $port = (int)(getenv('DB_PORT') ?: 3306);
    $dbname = getenv('DB_NAME') ?: 'share_market_expert';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : (getenv('DB_PASSWORD') ?: '');
    $sslCa = getenv('DB_SSL_CA') ?: '';

    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    if (!empty($sslCa)) {
        $caPath = $sslCa;
        if (!file_exists($caPath)) {
            $candidate = dirname(__DIR__) . DIRECTORY_SEPARATOR . $sslCa;
            if (file_exists($candidate)) {
                $caPath = $candidate;
            }
        }
        if (file_exists($caPath)) {
            $options[PDO::MYSQL_ATTR_SSL_CA] = $caPath;
        }
    }

    try {
        $pdo = new PDO($dsn, $user, $pass, $options);
        // Explicitly align MySQL session timezone to Asia/Kolkata (+05:30)
        try {
            $pdo->exec("SET time_zone = '+05:30'");
        } catch (Exception $e) {
            // Some cloud environments restrict time_zone setting; silently ignore
        }
        return $pdo;
    } catch (PDOException $e) {
        error_log("[Share Market Expert Admin DB Connection Error] " . $e->getMessage());
        throw new Exception("Database Connection Failed: " . $e->getMessage());
    }
}

