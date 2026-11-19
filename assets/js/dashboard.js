/**
 * SHARE MARKET EXPERT ADMIN — DASHBOARD CONTROLLER
 * Features:
 *   - 100 Leads Per Page Pagination
 *   - Form Source Identification (Popup vs Contact Us)
 *   - Live Search with 300ms Debounce
 *   - Single Date & Date Range Filter (Asia/Kolkata Timeline)
 *   - Excel / CSV Export
 *   - Lead Detail Dossier Modal
 *   - Lead Deletion with Confirmation
 *   - Table / Card View Switcher for Mobile & Desktop
 */

(function () {
  'use strict';

  const state = {
    currentPage: 1,
    limit: 100,
    totalPages: 1,
    totalItems: 0,
    search: '',
    formType: 'all',
    date: '',
    dateFrom: '',
    dateTo: '',
    status: 'all',
    sort: 'DESC',
    activeLeadToDelete: null,
    searchDebounceTimer: null,
    viewMode: window.innerWidth <= 768 ? 'cards' : 'table',
    isRangeMode: false
  };

  let dom = {};

  function init() {
    cacheDom();
    bindEvents();
    loadLeads();
  }

  function cacheDom() {
    dom = {
      // Stats
      statTotal: document.getElementById('statTotal'),
      statPopup: document.getElementById('statPopup'),
      statContact: document.getElementById('statContact'),
      statToday: document.getElementById('statToday'),

      // Filters
      filterSearch: document.getElementById('filterSearch'),
      filterFormType: document.getElementById('filterFormType'),
      filterDate: document.getElementById('filterDate'),
      filterDateFrom: document.getElementById('filterDateFrom'),
      filterDateTo: document.getElementById('filterDateTo'),
      singleDateContainer: document.getElementById('singleDateContainer'),
      rangeDateContainer: document.getElementById('rangeDateContainer'),
      btnToggleRange: document.getElementById('btnToggleRange'),
      btnResetFilters: document.getElementById('btnResetFilters'),
      btnExportCsv: document.getElementById('btnExportCsv'),

      // Views
      tableWrap: document.getElementById('tableWrap'),
      leadsTableBody: document.getElementById('leadsTableBody'),
      mobileCardsWrap: document.getElementById('mobileCardsWrap'),
      btnViewTable: document.getElementById('btnViewTable'),
      btnViewCards: document.getElementById('btnViewCards'),
      countBadge: document.getElementById('countBadge'),

      // Pagination
      paginationMeta: document.getElementById('paginationMeta'),
      btnPrevPage: document.getElementById('btnPrevPage'),
      btnNextPage: document.getElementById('btnNextPage'),
      pageIndicator: document.getElementById('pageIndicator'),
      pageSizeSelect: document.getElementById('pageSizeSelect'),

      // Detail Modal
      detailModal: document.getElementById('detailModal'),
      btnDetailClose: document.getElementById('btnDetailClose'),
      btnDetailCloseFooter: document.getElementById('btnDetailCloseFooter'),
      dossierGrid: document.getElementById('dossierGrid'),
      detailLeadRef: document.getElementById('detailLeadRef'),

      // Delete Modal
      deleteModal: document.getElementById('deleteModal'),
      btnDeleteCancel: document.getElementById('btnDeleteCancel'),
      btnDeleteClose: document.getElementById('btnDeleteClose'),
      btnDeleteConfirm: document.getElementById('btnDeleteConfirm'),
      deleteLeadRefSpan: document.getElementById('deleteLeadRefSpan'),

      // Logout & Toast
      btnLogout: document.getElementById('btnLogout'),
      toast: document.getElementById('toast'),
      toastMessage: document.getElementById('toastMessage')
    };
  }

  function bindEvents() {
    // Search with debounce
    if (dom.filterSearch) {
      dom.filterSearch.addEventListener('input', function () {
        clearTimeout(state.searchDebounceTimer);
        state.searchDebounceTimer = setTimeout(function () {
          state.search = dom.filterSearch.value.trim();
          state.currentPage = 1;
          loadLeads();
        }, 300);
      });
    }

    // Form type filter
    if (dom.filterFormType) {
      dom.filterFormType.addEventListener('change', function () {
        state.formType = dom.filterFormType.value;
        state.currentPage = 1;
        loadLeads();
      });
    }

    // Single Date filter
    if (dom.filterDate) {
      dom.filterDate.addEventListener('change', function () {
        state.date = dom.filterDate.value;
        state.dateFrom = '';
        state.dateTo = '';
        state.currentPage = 1;
        loadLeads();
      });
    }

    // Range Date filter
    if (dom.filterDateFrom) {
      dom.filterDateFrom.addEventListener('change', function () {
        state.dateFrom = dom.filterDateFrom.value;
        state.currentPage = 1;
        loadLeads();
      });
    }

    if (dom.filterDateTo) {
      dom.filterDateTo.addEventListener('change', function () {
        state.dateTo = dom.filterDateTo.value;
        state.currentPage = 1;
        loadLeads();
      });
    }

    // Toggle Single Date vs Range
    if (dom.btnToggleRange) {
      dom.btnToggleRange.addEventListener('click', function () {
        state.isRangeMode = !state.isRangeMode;
        if (state.isRangeMode) {
          dom.singleDateContainer.style.display = 'none';
          dom.rangeDateContainer.style.display = 'flex';
          dom.btnToggleRange.textContent = 'Switch to Single Date';
          state.date = '';
          if (dom.filterDate) dom.filterDate.value = '';
        } else {
          dom.singleDateContainer.style.display = 'flex';
          dom.rangeDateContainer.style.display = 'none';
          dom.btnToggleRange.textContent = 'Switch to Date Range';
          state.dateFrom = '';
          state.dateTo = '';
          if (dom.filterDateFrom) dom.filterDateFrom.value = '';
          if (dom.filterDateTo) dom.filterDateTo.value = '';
        }
        state.currentPage = 1;
        loadLeads();
      });
    }

    // Reset Filters
    if (dom.btnResetFilters) {
      dom.btnResetFilters.addEventListener('click', function () {
        state.search = '';
        state.formType = 'all';
        state.date = '';
        state.dateFrom = '';
        state.dateTo = '';
        state.currentPage = 1;

        if (dom.filterSearch) dom.filterSearch.value = '';
        if (dom.filterFormType) dom.filterFormType.value = 'all';
        if (dom.filterDate) dom.filterDate.value = '';
        if (dom.filterDateFrom) dom.filterDateFrom.value = '';
        if (dom.filterDateTo) dom.filterDateTo.value = '';

        loadLeads();
      });
    }

    // Export CSV
    if (dom.btnExportCsv) {
      dom.btnExportCsv.addEventListener('click', function () {
        exportCsv();
      });
    }

    // View toggles
    if (dom.btnViewTable) {
      dom.btnViewTable.addEventListener('click', function () {
        setViewMode('table');
      });
    }

    if (dom.btnViewCards) {
      dom.btnViewCards.addEventListener('click', function () {
        setViewMode('cards');
      });
    }

    // Pagination
    if (dom.btnPrevPage) {
      dom.btnPrevPage.addEventListener('click', function () {
        if (state.currentPage > 1) {
          state.currentPage--;
          loadLeads();
        }
      });
    }

    if (dom.btnNextPage) {
      dom.btnNextPage.addEventListener('click', function () {
        if (state.currentPage < state.totalPages) {
          state.currentPage++;
          loadLeads();
        }
      });
    }

    if (dom.pageSizeSelect) {
      dom.pageSizeSelect.addEventListener('change', function () {
        state.limit = parseInt(dom.pageSizeSelect.value, 10) || 100;
        state.currentPage = 1;
        loadLeads();
      });
    }

    // Modals
    if (dom.btnDetailClose) dom.btnDetailClose.addEventListener('click', closeDetailModal);
    if (dom.btnDetailCloseFooter) dom.btnDetailCloseFooter.addEventListener('click', closeDetailModal);

    if (dom.btnDeleteClose) dom.btnDeleteClose.addEventListener('click', closeDeleteModal);
    if (dom.btnDeleteCancel) dom.btnDeleteCancel.addEventListener('click', closeDeleteModal);
    if (dom.btnDeleteConfirm) dom.btnDeleteConfirm.addEventListener('click', confirmDeleteLead);

    // Logout
    if (dom.btnLogout) {
      dom.btnLogout.addEventListener('click', async function () {
        try {
          await fetch('/api/logout.php', { method: 'POST' });
        } catch {}
        window.location.href = '/login.html';
      });
    }
  }

  function setViewMode(mode) {
    state.viewMode = mode;
    if (mode === 'table') {
      if (dom.tableWrap) dom.tableWrap.style.display = 'block';
      if (dom.mobileCardsWrap) dom.mobileCardsWrap.style.display = 'none';
      if (dom.btnViewTable) dom.btnViewTable.classList.add('active');
      if (dom.btnViewCards) dom.btnViewCards.classList.remove('active');
    } else {
      if (dom.tableWrap) dom.tableWrap.style.display = 'none';
      if (dom.mobileCardsWrap) dom.mobileCardsWrap.style.display = 'flex';
      if (dom.btnViewCards) dom.btnViewCards.classList.add('active');
      if (dom.btnViewTable) dom.btnViewTable.classList.remove('active');
    }
  }

  async function loadLeads() {
    const params = new URLSearchParams({
      page: state.currentPage,
      limit: state.limit,
      form_type: state.formType,
      search: state.search,
      date: state.date,
      date_from: state.dateFrom,
      date_to: state.dateTo,
      sort: state.sort
    });

    try {
      const response = await fetch(`/api/leads.php?${params.toString()}`);

      if (response.status === 401) {
        window.location.href = '/login.html';
        return;
      }

      const json = await response.json();

      if (!json.success) {
        showToast(json.message || 'Error loading inquiries');
        return;
      }

      // Update Stats
      if (json.stats) {
        if (dom.statTotal) dom.statTotal.textContent = (json.stats.total || 0).toLocaleString();
        if (dom.statPopup) dom.statPopup.textContent = (json.stats.popup || 0).toLocaleString();
        if (dom.statContact) dom.statContact.textContent = (json.stats.contact || 0).toLocaleString();
        if (dom.statToday) dom.statToday.textContent = (json.stats.today || 0).toLocaleString();
      }

      // Update Pagination Meta
      state.totalItems = json.pagination.total_items;
      state.totalPages = json.pagination.total_pages;

      if (dom.countBadge) dom.countBadge.textContent = `${state.totalItems} Records`;

      const start = state.totalItems === 0 ? 0 : (state.currentPage - 1) * state.limit + 1;
      const end = Math.min(state.currentPage * state.limit, state.totalItems);
      if (dom.paginationMeta) {
        dom.paginationMeta.textContent = `Showing ${start} – ${end} of ${state.totalItems} Inquiries`;
      }

      if (dom.pageIndicator) {
        dom.pageIndicator.textContent = `Page ${state.currentPage} of ${state.totalPages}`;
      }

      if (dom.btnPrevPage) dom.btnPrevPage.disabled = !json.pagination.has_prev;
      if (dom.btnNextPage) dom.btnNextPage.disabled = !json.pagination.has_next;

      renderTable(json.data || []);
      renderCards(json.data || []);
    } catch (err) {
      showToast('Network error loading data');
    }
  }

  function renderTable(leads) {
    if (!dom.leadsTableBody) return;

    if (leads.length === 0) {
      dom.leadsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <p>No matching inquiries found.</p>
          </td>
        </tr>
      `;
      return;
    }

    dom.leadsTableBody.innerHTML = leads.map(lead => {
      const isPopup = lead.form_type === 'popup';
      const badgeClass = isPopup ? 'popup' : 'contact';
      const badgeText = isPopup ? 'Popup Form' : 'Contact Us';

      const cleanPhone = (lead.mobile_number || '').replace(/\D/g, '');
      const detailInfo = isPopup
        ? `${escapeHtml(lead.segment || 'Option (Call-Put)')} &bull; <span style="color:#94a3b8;">${escapeHtml(lead.capital_range || 'Above Rs 50,000')}</span>`
        : `<span style="font-style: italic; color:#cbd5e1;">"${escapeHtml((lead.message || 'Inquiry message').slice(0, 45))}${lead.message && lead.message.length > 45 ? '...' : ''}"</span>`;

      return `
        <tr>
          <td>
            <div class="lead-ref-text">${escapeHtml(lead.lead_reference)}</div>
            <div class="lead-time-text" title="${escapeHtml(lead.created_at)}">${escapeHtml(lead.created_at_formatted)} (${escapeHtml(lead.time_ago)})</div>
          </td>
          <td>
            <span class="badge-source ${badgeClass}">${badgeText}</span>
          </td>
          <td>
            <strong style="color:#ffffff;">${escapeHtml(lead.full_name)}</strong>
          </td>
          <td>
            <a href="tel:${cleanPhone}" class="phone-link">+91 ${cleanPhone}</a>
            <a href="https://wa.me/91${cleanPhone}" target="_blank" rel="noopener noreferrer" class="whatsapp-icon-btn" title="Chat on WhatsApp">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </a>
          </td>
          <td>${escapeHtml(lead.state)}</td>
          <td>${detailInfo}</td>
          <td>
            <div class="actions-cell">
              <button type="button" class="btn-icon-action view" onclick="window.viewLeadDetails(${lead.id})" title="View Details">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
              <button type="button" class="btn-icon-action delete" onclick="window.confirmDelete(${lead.id}, '${escapeHtml(lead.lead_reference)}')" title="Delete Inquiry">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderCards(leads) {
    if (!dom.mobileCardsWrap) return;

    if (leads.length === 0) {
      dom.mobileCardsWrap.innerHTML = `
        <div class="empty-state">
          <p>No matching inquiries found.</p>
        </div>
      `;
      return;
    }

    dom.mobileCardsWrap.innerHTML = leads.map(lead => {
      const isPopup = lead.form_type === 'popup';
      const badgeClass = isPopup ? 'popup' : 'contact';
      const badgeText = isPopup ? 'Popup Form' : 'Contact Us';
      const cleanPhone = (lead.mobile_number || '').replace(/\D/g, '');

      return `
        <div class="mobile-card">
          <div class="mobile-card-header">
            <div>
              <div class="lead-ref-text">${escapeHtml(lead.lead_reference)}</div>
              <div class="lead-time-text">${escapeHtml(lead.created_at_formatted)}</div>
            </div>
            <span class="badge-source ${badgeClass}">${badgeText}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-card-label">Name</span>
            <span class="mobile-card-value">${escapeHtml(lead.full_name)}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-card-label">Mobile</span>
            <span class="mobile-card-value"><a href="tel:${cleanPhone}" class="phone-link">+91 ${cleanPhone}</a></span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-card-label">State</span>
            <span class="mobile-card-value">${escapeHtml(lead.state)}</span>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-card-label">${isPopup ? 'Focus Area' : 'Message'}</span>
            <span class="mobile-card-value">${escapeHtml(isPopup ? lead.segment : lead.message)}</span>
          </div>
          <div class="mobile-card-actions">
            <button type="button" class="btn-action reset" style="flex:1; justify-content:center;" onclick="window.viewLeadDetails(${lead.id})">View Full Dossier</button>
            <button type="button" class="btn-action" style="background:var(--danger-bg); color:#fca5a5; border:1px solid var(--danger-border);" onclick="window.confirmDelete(${lead.id}, '${escapeHtml(lead.lead_reference)}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Global hooks for onclick
  window.viewLeadDetails = async function (id) {
    try {
      const res = await fetch(`/api/lead-detail.php?id=${id}`);
      const json = await res.json();
      if (!json.success || !json.data) {
        showToast(json.message || 'Unable to open lead details');
        return;
      }

      const l = json.data;
      if (dom.detailLeadRef) dom.detailLeadRef.textContent = l.lead_reference;

      const isPopup = l.form_type === 'popup';
      const sourceBadge = isPopup
        ? '<span class="badge-source popup">Popup Enquiry Modal</span>'
        : '<span class="badge-source contact">Contact Us Page Form</span>';

      const cleanPhone = (l.mobile_number || '').replace(/\D/g, '');

      if (dom.dossierGrid) {
        dom.dossierGrid.innerHTML = `
          <div class="dossier-item">
            <span class="dossier-label">Form Source</span>
            <div class="dossier-value">${sourceBadge}</div>
          </div>
          <div class="dossier-item">
            <span class="dossier-label">Submission Time (IST)</span>
            <div class="dossier-value">${escapeHtml(l.created_at_formatted)}</div>
          </div>
          <div class="dossier-item">
            <span class="dossier-label">Full Name</span>
            <div class="dossier-value" style="font-size:1.05rem; font-weight:700; color:#fff;">${escapeHtml(l.full_name)}</div>
          </div>
          <div class="dossier-item">
            <span class="dossier-label">Contact Number</span>
            <div class="dossier-value">
              <a href="tel:${cleanPhone}" class="phone-link" style="color:var(--primary); font-size:1.05rem;">+91 ${cleanPhone}</a>
              <a href="https://wa.me/91${cleanPhone}" target="_blank" rel="noopener noreferrer" style="margin-left:8px; color:#25d366; text-decoration:none;">(WhatsApp)</a>
            </div>
          </div>
          <div class="dossier-item">
            <span class="dossier-label">State / Union Territory</span>
            <div class="dossier-value">${escapeHtml(l.state)}</div>
          </div>
          <div class="dossier-item">
            <span class="dossier-label">Source Page</span>
            <div class="dossier-value">${escapeHtml(l.source_page)}</div>
          </div>
          ${isPopup ? `
            <div class="dossier-item">
              <span class="dossier-label">Preferred Learning Focus</span>
              <div class="dossier-value" style="color:#38bdf8;">${escapeHtml(l.segment)}</div>
            </div>
            <div class="dossier-item">
              <span class="dossier-label">Educational Capital Scale</span>
              <div class="dossier-value" style="color:#fcd34d;">${escapeHtml(l.capital_range)}</div>
            </div>
          ` : `
            <div class="dossier-item full-width">
              <span class="dossier-label">Inquiry Message / Query</span>
              <div class="dossier-value" style="background:rgba(255,255,255,0.04); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); white-space:pre-wrap;">${escapeHtml(l.message)}</div>
            </div>
          `}
          <div class="dossier-item">
            <span class="dossier-label">Visitor IP Address</span>
            <div class="dossier-value" style="font-family:monospace; font-size:0.85rem;">${escapeHtml(l.ip_address)}</div>
          </div>
          <div class="dossier-item">
            <span class="dossier-label">Status</span>
            <div class="dossier-value" style="text-transform:capitalize; color:var(--primary); font-weight:600;">${escapeHtml(l.status)}</div>
          </div>
        `;
      }

      if (dom.detailModal) dom.detailModal.classList.add('open');
    } catch {
      showToast('Network error opening lead dossier');
    }
  };

  function closeDetailModal() {
    if (dom.detailModal) dom.detailModal.classList.remove('open');
  }

  window.confirmDelete = function (id, ref) {
    state.activeLeadToDelete = id;
    if (dom.deleteLeadRefSpan) dom.deleteLeadRefSpan.textContent = ref;
    if (dom.deleteModal) dom.deleteModal.classList.add('open');
  };

  function closeDeleteModal() {
    state.activeLeadToDelete = null;
    if (dom.deleteModal) dom.deleteModal.classList.remove('open');
  }

  async function confirmDeleteLead() {
    if (!state.activeLeadToDelete) return;

    try {
      const res = await fetch('/api/delete-lead.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: state.activeLeadToDelete })
      });

      const json = await res.json();
      if (json.success) {
        showToast('Inquiry record deleted successfully');
        closeDeleteModal();
        loadLeads();
      } else {
        showToast(json.message || 'Failed to delete record');
      }
    } catch {
      showToast('Network error deleting record');
    }
  }

  function exportCsv() {
    const params = new URLSearchParams({
      form_type: state.formType,
      search: state.search,
      date: state.date,
      date_from: state.dateFrom,
      date_to: state.dateTo,
      status: state.status
    });

    window.location.href = `/api/export-csv.php?${params.toString()}`;
  }

  function showToast(msg) {
    if (!dom.toast || !dom.toastMessage) return;
    dom.toastMessage.textContent = msg;
    dom.toast.classList.add('show');
    setTimeout(() => {
      dom.toast.classList.remove('show');
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

