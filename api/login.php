<?php
/**
 * ============================================================================
 * SHARE MARKET EXPERT ADMIN — AUTHENTICATION ENDPOINT
 * Endpoint: POST /api/login.php
 * ============================================================================
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/auth.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed. Use POST.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    $data = $_POST;
}

$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit;
}

try {
    $pdo = getAdminDB();

    $stmt = $pdo->prepare("SELECT id, username, password_hash, role FROM `admin_users` WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        // Fallback for initial local setup if table was just seeded
        $envUser = getenv('ADMIN_DEFAULT_USER') ?: 'admin';
        $envPass = getenv('ADMIN_DEFAULT_PASS') ?: 'Option@2026#Trading';

        if ($username === $envUser && $password === $envPass) {
            loginAdminSession($username, 'super_admin');
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => ['username' => $username, 'role' => 'super_admin']
            ]);
            exit;
        }

        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
        exit;
    }

    // Update last_login
    $updateStmt = $pdo->prepare("UPDATE `admin_users` SET last_login = NOW() WHERE id = ?");
    $updateStmt->execute([$admin['id']]);

    loginAdminSession($admin['username'], $admin['role'] ?? 'super_admin');

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'username' => $admin['username'],
            'role' => $admin['role'] ?? 'super_admin'
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Authentication service error: ' . $e->getMessage()]);
}

