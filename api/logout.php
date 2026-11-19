<?php
/**
 * ============================================================================
 * SHARE MARKET EXPERT ADMIN — LOGOUT ENDPOINT
 * Endpoint: POST /api/logout.php
 * ============================================================================
 */

require_once dirname(__DIR__) . '/config/auth.php';

header('Content-Type: application/json; charset=UTF-8');

logoutAdminSession();

echo json_encode([
    'success' => true,
    'message' => 'Signed out successfully',
    'redirect' => '/login.html'
]);

