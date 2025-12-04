// Get API base
const DASHBOARD_API_BASE = document.body?.dataset?.apiBase || 'http://localhost:3000/api';

// ===== AUTH =====
const token = localStorage.getItem('eventease_token');
const userJson = localStorage.getItem('eventease_user');

if (!token || !userJson) {
    window.location.href = 'login.html';
}

const user = userJson ? JSON.parse(userJson) : null;

// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
    setupWelcomeUser();
    setupWelcomeBanner();
    setupLogout();
    setupQuickActions();
    loadDashboardData();
    highlightActiveNav();
    navbarScrollShadow();
    setupNotifications();
    setupSearch();
});

// ===== Welcome =====
function setupWelcomeUser() {
    const welcomeEl = document.getElementById('welcomeUser');
    if (!welcomeEl || !user) return;
    const name = user.name || user.email || 'User';
    welcomeEl.textContent = `Welcome, ${name}`;
}

function setupWelcomeBanner() {
    const banner = document.getElementById('welcome-banner');
    if (!banner || !user) return;
    const name = user.name || user.email || 'User';
    banner.innerText = `Welcome back, ${name}! 🎉`;
}

// ===== Logout =====
function setupLogout() {
    const logoutBtns = [document.getElementById('logoutBtnDropdown'), document.getElementById('logoutBtn')];
    logoutBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            localStorage.removeItem('eventease_token');
            localStorage.removeItem('eventease_user');
            window.location.href = 'login.html';
        });
    });
}

// ===== Quick Actions =====
function setupQuickActions() {
    const btnCreate = document.getElementById('btnCreateEvent');
    const btnEvents = document.getElementById('btnViewEvents');
    const btnReports = document.getElementById('btnViewReports');

    if (btnCreate) btnCreate.addEventListener('click', () => alert('Create Event page coming soon.'));
    if (btnEvents) btnEvents.addEventListener('click', () => alert('Events management page coming soon.'));
    if (btnReports) btnReports.addEventListener('click', () => alert('Reports page coming soon.'));
}

// ===== Dashboard Data =====
async function loadDashboardData() {
    const statEvents = document.getElementById('statTotalEvents');
    const statAttendees = document.getElementById('statTotalAttendees');
    const statRevenue = document.getElementById('statRevenue');
    const upcomingList = document.getElementById('upcomingEventsList');
    const eventsCountLabel = document.getElementById('eventsCountLabel');

    if (!statEvents || !statAttendees || !statRevenue || !upcomingList || !eventsCountLabel) return;

    try {
        const res = await fetch(`${DASHBOARD_API_BASE}/dashboard`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const stats = data.stats || {};
        const events = data.upcomingEvents || [];

        statEvents.textContent = stats.totalEvents ?? 0;
        statAttendees.textContent = stats.totalAttendees ?? 0;
        statRevenue.textContent = stats.revenue ? `$${Number(stats.revenue).toLocaleString()}` : '$0';
        eventsCountLabel.textContent = `${events.length} event${events.length === 1 ? '' : 's'}`;

        upcomingList.innerHTML = '';
        if (events.length === 0) upcomingList.innerHTML = '<div class="text-muted">No upcoming events. Create one to get started!</div>';

        events.forEach(event => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
            item.dataset.eventName = event.name.toLowerCase(); // for search
            item.innerHTML = `
                <div class="ms-2 me-auto">
                    <div class="fw-bold">${event.name}</div>
                    <div class="small text-muted"><i class="bi bi-geo-alt"></i> ${event.location || 'TBA'}</div>
                </div>
                <span class="badge bg-primary rounded-pill">${event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</span>
            `;
            upcomingList.appendChild(item);
        });
    } catch (err) {
        console.error('Error loading dashboard data:', err);
        upcomingList.innerHTML = '<div class="text-danger">Dashboard data endpoint not available yet.</div>';
    }
}

// ===== Navbar Utilities =====
function highlightActiveNav() {
    const links = document.querySelectorAll('.navbar-nav .nav-link');
    const current = window.location.pathname.split('/').pop();
    links.forEach(link => { if (link.getAttribute('href') === current) link.classList.add('active'); });
}

function navbarScrollShadow() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });
}

// ===== Notifications Demo =====
function setupNotifications() {
    const badge = document.getElementById('notifBadge');
    const list = document.getElementById('notifList');

    const notifications = [
        'New attendee registered for Event A',
        'Event B is starting soon',
        'Event C was updated'
    ];

    if (notifications.length > 0) {
        badge.textContent = notifications.length;
        list.innerHTML = notifications.map(n => `<div class="dropdown-item small">${n}</div>`).join('');
    }
}

// ===== Live Search =====
function setupSearch() {
    const searchInput = document.getElementById('navSearch');
    const items = document.querySelectorAll('#upcomingEventsList a');

    if (!searchInput || !items) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        items.forEach(item => {
            item.style.display = item.dataset.eventName.includes(query) ? '' : 'none';
        });
    });
}
