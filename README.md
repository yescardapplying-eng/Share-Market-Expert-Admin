# Share Market Expert — Admin Management Portal

Dedicated, secure, standalone administrative management portal for **Share Market Expert** (`https://sharemarketexpert.in`).

Designed to run on Hostinger standard PHP hosting with zero complex dependencies.

---

## Key Features

1. **Popup & Contact Us Lead Tracking**:
   - Visual Badges: `[Popup Form]` (Emerald/Teal) vs `[Contact Us]` (Sky Blue).
   - Filter dropdown to isolate leads by origin.
2. **Asia/Kolkata (IST) Timeline**:
   - All dates and timestamps are localized to Indian Standard Time (`+05:30`).
3. **100 Leads Per Page Pagination**:
   - Fast, server-side pagination with selectable limits (25, 50, 100, 200).
4. **Live Search**:
   - 300ms debounced search by Name, Phone, State, Preferred Segment, or Message.
5. **Date Filtering**:
   - Single date filter (`YYYY-MM-DD`).
   - Date range filter (From Date & To Date).
6. **Excel / CSV Export**:
   - 1-click UTF-8 BOM CSV export formatted for Microsoft Excel & Google Sheets.
7. **Lead Dossier Modal**:
   - Complete record preview with one-click phone call and direct WhatsApp link.
8. **Permanent Deletion**:
   - Secure deletion with confirmation modal.
9. **Fully Responsive**:
   - Mobile, Tablet, and Desktop optimized with automatic card/table view switching.

---

## Directory Structure

```text
d:\Share Market Expert Admin\
├── .env.example             # Hostinger database template
├── .htaccess                # Apache / LiteSpeed security rules
├── index.html               # Main dashboard UI
├── login.html               # Secure login interface
├── router.php               # Local development server router
├── README.md                # Documentation
├── api/
│   ├── login.php            # Admin authentication
│   ├── logout.php           # Session revocation
│   ├── leads.php            # Paginated inquiries with stats & filters
│   ├── lead-detail.php      # Full inquiry dossier modal data
│   ├── delete-lead.php      # Inquiry deletion
│   └── export-csv.php       # Excel-compatible CSV export
├── assets/
│   ├── css/
│   │   ├── auth.css         # Dark glassmorphic login styles
│   │   └── dashboard.css    # High-density responsive dashboard styles
│   ├── js/
│   │   ├── auth.js          # Login interaction
│   │   └── dashboard.js     # Dashboard state & event handlers
│   └── images/              # Official brand logos
├── config/
│   ├── auth.php             # Session management & security guards
│   └── database.php         # PDO connection with Asia/Kolkata timezone
└── database/
    ├── schema.sql           # MySQL database tables
    └── setup.php            # One-click CLI/Web migration runner
```

---

## Hostinger Deployment Guide

1. Create a subdomain (e.g., `admin.sharemarketexpert.in`) or upload to a folder in Hostinger File Manager.
2. Extract the portal files.
3. Copy `.env.example` to `.env` and fill in your Hostinger MySQL database details.
4. Open `/database/setup.php` or import `database/schema.sql` into phpMyAdmin.
5. Log in at `https://admin.sharemarketexpert.in`:
   - **Username**: `admin`
   - **Password**: `Option@2026#Trading` (changeable in `.env`)

