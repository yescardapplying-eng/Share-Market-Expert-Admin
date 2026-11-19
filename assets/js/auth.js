/**
 * SHARE MARKET EXPERT ADMIN — LOGIN CONTROLLER
 */

(function () {
  'use strict';

  const form = document.getElementById('loginForm');
  const errorAlert = document.getElementById('errorAlert');
  const errorMessage = document.getElementById('errorMessage');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnTogglePassword = document.getElementById('btnTogglePassword');
  const passwordInput = document.getElementById('password');

  if (btnTogglePassword && passwordInput) {
    btnTogglePassword.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      const icon = btnTogglePassword.querySelector('svg');
      if (type === 'text') {
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
      } else {
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
      }
    });
  }

  function showError(msg) {
    if (errorMessage && errorAlert) {
      errorMessage.textContent = msg || 'Invalid username or password.';
      errorAlert.classList.add('show');
    }
  }

  function hideError() {
    if (errorAlert) {
      errorAlert.classList.remove('show');
    }
  }

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError();

      const username = document.getElementById('username').value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        showError('Please enter both username and password.');
        return;
      }

      btnSubmit.disabled = true;
      const originalText = btnSubmit.innerHTML;
      btnSubmit.innerHTML = 'Signing In...';

      try {
        const response = await fetch('/api/login.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data && data.success) {
          window.location.href = '/index.html';
        } else {
          showError(data?.message || 'Login failed. Please verify credentials.');
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = originalText;
        }
      } catch (err) {
        showError('Network error connecting to authentication server.');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
      }
    });
  }
})();

