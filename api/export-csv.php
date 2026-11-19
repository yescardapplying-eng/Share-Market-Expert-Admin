<?php
/**
 * ============================================================================
 * SHARE MARKET EXPERT ADMIN — EXPORT LEADS TO EXCEL / CSV
 * Endpoint: GET /api/export-csv.php
 * Timezone: Asia/Kolkata (IST)
 * Output: UTF-8 BOM CSV (Direct Excel opening without encoding issues)
 * ============================================================================
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/auth.php';

requireAdminAuth(false); // If browser hits directly, redirects to login

try {
    $pdo = getAdminDB();

    $formType = trim($_GET['form_type'] ?? 'all');
    $date = trim($_GET['date'] ?? '');
    $dateFrom = trim($_GET['date_from'] ?? '');
    $dateTo = trim($_GET['date_to'] ?? '');
    $search = trim($_GET['search'] ?? '');
    $status = trim($_GET['status'] ?? 'all');

    $where = ["1=1"];
    $params = [];

    if ($formType === 'popup' || $formType === 'contact') {
        $where[] = "form_type = :form_type";
        $params[':form_type'] = $formType;
    }

    if (!empty($date)) {
        $where[] = "DATE(created_at) = :exact_date";
        $params[':exact_date'] = $date;
    } else {
        if (!empty($dateFrom)) {
            $where[] = "DATE(created_at) >= :date_from";
            $params[':date_from'] = $dateFrom;
        }
        if (!empty($dateTo)) {
            $where[] = "DATE(created_at) <= :date_to";
            $params[':date_to'] = $dateTo;
        }
    }

    if ($status !== 'all' && in_array($status, ['new', 'contacted', 'enrolled', 'not_interested', 'invalid'], true)) {
        $where[] = "status = :status";
        $params[':status'] = $status;
    }

    if (!empty($search)) {
        $where[] = "(
            full_name LIKE :search 
            OR mobile_number LIKE :search 
            OR lead_reference LIKE :search 
            OR state LIKE :search 
            OR segment LIKE :search 
            OR message LIKE :search
        )";
        $params[':search'] = "%{$search}%";
    }

    $whereSql = implode(' AND ', $where);

    $sql = "
        SELECT 
            id, form_type, lead_reference, full_name, mobile_number,
            state, segment, capital_range, message, source_page,
            ip_address, status, created_at
        FROM `leads`
        WHERE {$whereSql}
        ORDER BY created_at DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $fileName = 'ShareMarketExpert_Leads_' . date('Ymd_His') . '.csv';

    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $fileName . '"');
    header('Pragma: no-cache');
    header('Expires: 0');

    $output = fopen('php://output', 'w');

    // Add UTF-8 BOM so Excel opens Hindi/Special chars correctly
    fputs($output, "\xEF\xBB\xBF");

    // CSV Header row
    fputcsv($output, [
        'ID',
        'Reference ID',
        'Form Source',
        'Full Name',
        'Mobile Number',
        'State / Union Territory',
        'Preferred Learning Segment',
        'Capital Scale',
        'Message / Query',
        'Source Page',
        'IP Address',
        'Status',
        'Submission Date & Time (IST)'
    ]);

    foreach ($rows as $r) {
        $timestamp = strtotime($r['created_at']);
        $istTime = date('d-M-Y h:i:s A', $timestamp);
        $sourceLabel = ($r['form_type'] === 'popup') ? 'Popup Enquiry' : 'Contact Us Form';

        fputcsv($output, [
            $r['id'],
            $r['lead_reference'] ?: ('SME-' . $r['id']),
            $sourceLabel,
            $r['full_name'],
            $r['mobile_number'],
            $r['state'] ?: '',
            $r['segment'] ?: '',
            $r['capital_range'] ?: '',
            $r['message'] ?: '',
            $r['source_page'] ?: '/',
            $r['ip_address'] ?: '',
            ucfirst($r['status'] ?: 'new'),
            $istTime
        ]);
    }

    fclose($output);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo "Export Error: " . $e->getMessage();
}

