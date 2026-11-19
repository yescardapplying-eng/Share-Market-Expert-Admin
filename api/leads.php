<?php
/**
 * ============================================================================
 * SHARE MARKET EXPERT ADMIN — LEADS & INQUIRIES LISTING API
 * Endpoint: GET /api/leads.php
 * Features:
 *   - 100 per page pagination (server-side)
 *   - Live Stats (Total, Popup Leads, Contact Messages, Today's Leads)
 *   - Source filtering ('all', 'popup', 'contact')
 *   - Exact Date & Date Range filtering (Asia/Kolkata timeline)
 *   - Live text search (Name, Phone, State, Segment, Message, Ref ID)
 * ============================================================================
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/auth.php';

requireAdminAuth(true);

header('Content-Type: application/json; charset=UTF-8');

try {
    $pdo = getAdminDB();

    // 1. Pagination Parameters
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(250, (int)($_GET['limit'] ?? 100)));
    $offset = ($page - 1) * $limit;

    // 2. Filter Parameters
    $formType = trim($_GET['form_type'] ?? 'all');
    $date = trim($_GET['date'] ?? '');
    $dateFrom = trim($_GET['date_from'] ?? '');
    $dateTo = trim($_GET['date_to'] ?? '');
    $search = trim($_GET['search'] ?? '');
    $status = trim($_GET['status'] ?? 'all');
    $sort = strtoupper(trim($_GET['sort'] ?? 'DESC'));
    if ($sort !== 'ASC' && $sort !== 'DESC') {
        $sort = 'DESC';
    }

    $where = ["1=1"];
    $params = [];

    // Form Type Filter (Popup vs Contact Us)
    if ($formType === 'popup' || $formType === 'contact') {
        $where[] = "form_type = :form_type";
        $params[':form_type'] = $formType;
    }

    // Date Filters (Evaluated in Asia/Kolkata date)
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

    // Status Filter
    if ($status !== 'all' && in_array($status, ['new', 'contacted', 'enrolled', 'not_interested', 'invalid'], true)) {
        $where[] = "status = :status";
        $params[':status'] = $status;
    }

    // Live Search Filter
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

    // 3. Overall Statistics (Independent of active search filters)
    $statsStmt = $pdo->query("
        SELECT
            COUNT(*) as total_inquiries,
            SUM(CASE WHEN form_type = 'popup' THEN 1 ELSE 0 END) as popup_leads,
            SUM(CASE WHEN form_type = 'contact' THEN 1 ELSE 0 END) as contact_leads,
            SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_leads
        FROM `leads`
    ");
    $statsRaw = $statsStmt->fetch() ?: [];

    $stats = [
        'total' => (int)($statsRaw['total_inquiries'] ?? 0),
        'popup' => (int)($statsRaw['popup_leads'] ?? 0),
        'contact' => (int)($statsRaw['contact_leads'] ?? 0),
        'today' => (int)($statsRaw['today_leads'] ?? 0),
    ];

    // 4. Count Filtered Matching Records
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM `leads` WHERE {$whereSql}");
    $countStmt->execute($params);
    $totalFiltered = (int)$countStmt->fetchColumn();

    $totalPages = (int)ceil($totalFiltered / $limit);
    if ($totalPages === 0) {
        $totalPages = 1;
    }

    // 5. Fetch Paginated Records
    $sql = "
        SELECT 
            id, form_type, lead_reference, full_name, mobile_number,
            state, segment, capital_range, message, source_page,
            ip_address, user_agent, status, notes, created_at, updated_at
        FROM `leads`
        WHERE {$whereSql}
        ORDER BY created_at {$sort}
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    // 6. Format Items with Asia/Kolkata Timestamp
    $items = [];
    foreach ($rows as $row) {
        $timestamp = strtotime($row['created_at']);
        $formattedDate = date('d M Y, h:i A', $timestamp); // e.g. "07 Nov 2026, 09:30 PM"

        $timeDiff = time() - $timestamp;
        if ($timeDiff < 60) {
            $timeAgo = 'Just now';
        } elseif ($timeDiff < 3600) {
            $mins = floor($timeDiff / 60);
            $timeAgo = "{$mins} min" . ($mins > 1 ? 's' : '') . " ago";
        } elseif ($timeDiff < 86400 && date('Y-m-d') === date('Y-m-d', $timestamp)) {
            $timeAgo = "Today at " . date('h:i A', $timestamp);
        } elseif ($timeDiff < 172800 && date('Y-m-d', strtotime('-1 day')) === date('Y-m-d', $timestamp)) {
            $timeAgo = "Yesterday at " . date('h:i A', $timestamp);
        } else {
            $timeAgo = date('d M Y', $timestamp);
        }

        $items[] = [
            'id' => (int)$row['id'],
            'form_type' => $row['form_type'] ?? 'popup',
            'lead_reference' => $row['lead_reference'] ?: ('SME-' . $row['id']),
            'full_name' => $row['full_name'],
            'mobile_number' => $row['mobile_number'],
            'state' => $row['state'] ?: '—',
            'segment' => $row['segment'] ?: '—',
            'capital_range' => $row['capital_range'] ?: '—',
            'message' => $row['message'] ?: '—',
            'source_page' => $row['source_page'] ?: '/',
            'ip_address' => $row['ip_address'] ?: '—',
            'status' => $row['status'] ?: 'new',
            'notes' => $row['notes'] ?: '',
            'created_at' => $row['created_at'],
            'created_at_formatted' => $formattedDate,
            'time_ago' => $timeAgo,
        ];
    }

    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'pagination' => [
            'current_page' => $page,
            'limit' => $limit,
            'total_items' => $totalFiltered,
            'total_pages' => $totalPages,
            'has_prev' => $page > 1,
            'has_next' => $page < $totalPages,
        ],
        'data' => $items,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to retrieve inquiries: ' . $e->getMessage()
    ]);
}

