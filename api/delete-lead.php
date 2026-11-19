<?php
/**
 * ============================================================================
 * SHARE MARKET EXPERT ADMIN — DELETE INQUIRY API
 * Endpoint: POST /api/delete-lead.php
 * ============================================================================
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/auth.php';

requireAdminAuth(true);

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed. Use POST.']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$id = (int)($data['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing inquiry ID.']);
    exit;
}

try {
    $pdo = getAdminDB();

    $stmt = $pdo->prepare("DELETE FROM `leads` WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Inquiry record deleted successfully.'
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Inquiry record not found or already deleted.'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to delete inquiry: ' . $e->getMessage()
    ]);
}

