<?php
/**
 * ============================================================================
 * SHARE MARKET EXPERT ADMIN — LEAD DOSSIER & DETAIL API
 * Endpoint: GET /api/lead-detail.php?id=<id>
 * ============================================================================
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/auth.php';

requireAdminAuth(true);

header('Content-Type: application/json; charset=UTF-8');

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing inquiry ID.']);
    exit;
}

try {
    $pdo = getAdminDB();

    $stmt = $pdo->prepare("SELECT * FROM `leads` WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $lead = $stmt->fetch();

    if (!$lead) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Inquiry record not found.']);
        exit;
    }

    $timestamp = strtotime($lead['created_at']);
    $formattedDate = date('d M Y, h:i:s A', $timestamp);

    $leadData = [
        'id' => (int)$lead['id'],
        'form_type' => $lead['form_type'] ?? 'popup',
        'lead_reference' => $lead['lead_reference'] ?: ('SME-' . $lead['id']),
        'full_name' => $lead['full_name'],
        'mobile_number' => $lead['mobile_number'],
        'state' => $lead['state'] ?: 'Not Specified',
        'segment' => $lead['segment'] ?: '—',
        'capital_range' => $lead['capital_range'] ?: '—',
        'message' => $lead['message'] ?: '—',
        'source_page' => $lead['source_page'] ?: '/',
        'ip_address' => $lead['ip_address'] ?: '—',
        'user_agent' => $lead['user_agent'] ?: '—',
        'status' => $lead['status'] ?: 'new',
        'notes' => $lead['notes'] ?: '',
        'created_at' => $lead['created_at'],
        'created_at_formatted' => $formattedDate,
    ];

    echo json_encode([
        'success' => true,
        'data' => $leadData
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load inquiry dossier: ' . $e->getMessage()
    ]);
}

