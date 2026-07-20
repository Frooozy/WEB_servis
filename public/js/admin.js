// public/js/admin.js
document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('authSection');
    const adminPanel = document.getElementById('adminPanel');
    const loginForm = document.getElementById('loginForm');
    const loginAlert = document.getElementById('loginAlert');
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    const logoutBtn = document.getElementById('logoutBtn');

    loadBookings();

    // Authenticate user
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('../api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Authentication failed');

            loginForm.reset();
            loginAlert.innerHTML = '';
            loadBookings();
        } catch (err) {
            loginAlert.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    });

    // Terminate session
    logoutBtn.addEventListener('click', async () => {
        await fetch('../api/logout.php', { method: 'POST' });
        authSection.classList.remove('d-none');
        adminPanel.classList.add('d-none');
    });

    // Fetch and display existing bookings
    async function loadBookings() {
        try {
            const response = await fetch('../api/get_bookings.php');
            const data = await response.json();

            if (response.status === 403) {
                authSection.classList.remove('d-none');
                adminPanel.classList.add('d-none');
                return;
            }

            if (!response.ok) throw new Error(data.error || 'Failed to load data');

            authSection.classList.add('d-none');
            adminPanel.classList.remove('d-none');
            renderTable(data.bookings || []);
        } catch (err) {
            console.error(err);
        }
    }

    // Render bookings table content safely
    function renderTable(bookings) {
        if (bookings.length === 0) {
            bookingsTableBody.innerHTML = '<tr><td colspan="7" class="text-center py-3">No bookings found</td></tr>';
            return;
        }

        bookingsTableBody.innerHTML = bookings.map(b => `
            <tr>
                <td>${b.id}</td>
                <td>${escapeHtml(b.client_name)}</td>
                <td>${escapeHtml(b.client_phone)}</td>
                <td><span class="badge bg-info text-dark">${escapeHtml(b.service_type)}</span></td>
                <td>${b.booking_date}</td>
                <td><strong>${b.booking_time}</strong></td>
                <td><small class="text-muted">${b.created_at}</small></td>
            </tr>
        `).join('');
    }

    // Escape special characters to prevent XSS attacks
    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, match => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match]));
    }
});