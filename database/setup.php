<?php
/**
 * ============================================================================
 * SHARE MARKET EXPERT ADMIN — DATABASE MIGRATION & ADMIN SETUP
 * Usage:
 *   CLI: php database/setup.php
 *   Web: /database/setup.php (Protected)
 * ============================================================================
 */

require_once dirname(__DIR__) . '/config/database.php';

header('Content-Type: text/plain; charset=UTF-8');

try {
    $pdo = getAdminDB();
    echo "[SETUP] Connected to MySQL successfully.\n";

    $schemaFile = __DIR__ . '/schema.sql';
    if (!file_exists($schemaFile)) {
        throw new Exception("schema.sql not found at {$schemaFile}");
    }

    $sql = file_get_contents($schemaFile);
    $pdo->exec($sql);
    echo "[SETUP] Database schema executed successfully.\n";

    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM `admin_users`");
    $stmt->execute();
    $adminCount = (int)$stmt->fetchColumn();

    if ($adminCount === 0) {
        $defaultUser = getenv('ADMIN_DEFAULT_USER') ?: 'admin';
        $defaultPass = getenv('ADMIN_DEFAULT_PASS') ?: 'Option@2026#Trading';
        $hash = password_hash($defaultPass, PASSWORD_BCRYPT, ['cost' => 12]);

        $ins = $pdo->prepare("INSERT INTO `admin_users` (`username`, `password_hash`, `role`) VALUES (?, ?, 'super_admin')");
        $ins->execute([$defaultUser, $hash]);

        echo "[SETUP] Default admin created:\n";
        echo "        Username: {$defaultUser}\n";
        echo "        Password: {$defaultPass}\n";
    } else {
        echo "[SETUP] Existing admin user(s) found ({$adminCount}). Skipping user creation.\n";
    }

    echo "[SETUP] Complete! Your Share Market Expert Admin Portal is ready.\n";
} catch (Exception $e) {
    echo "[ERROR] Setup failed: " . $e->getMessage() . "\n";
    exit(1);
}

