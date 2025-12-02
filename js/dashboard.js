// js/dashboard.js

// Get API base from body (same pattern as main.js)
const DASHBOARD_API_BASE =
    document.body?.dataset?.apiBase || 'http://localhost:3000/api';

// ===== AUTH GUARD =====
const token = localStorage.getItem('eventease_token');
const userJson = localStorage.getItem('eventease_user');

if (!token || !userJson) {
    // Not logged in → go back to login
    window.location.href = 'login.html';
}

const user = userJson ? JSON.parse(userJson) : null;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    setupWelcomeUser();
    setupLogout();
    setupQuickActions();
    loadDashboardData(); // you can comment this out if you don't have an API route yet
});

function setupWelcomeUser() {
    const welcomeEl = document.getElementById('welcomeUser');
    if (!welcomeEl || !user) return;

    const name = user.name || user.email || 'User';
    welcomeEl.textContent = `Welcome, ${name}`;
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('eventease_token');
        localStorage.removeItem('eventease_user');
        window.location.href = 'login.html';
    });
}

function setupQuickActions() {
    const btnCreate = document.getElementById('btnCreateEvent');
    const btnEvents = document.getElementById('btnViewEvents');
    const btnReports = document.getElementById('btnViewReports');

    // TODO: point these to your real pages when you have them
    if (btnCreate) {
        btnCreate.addEventListener('click', () => {
            alert('Create Event page coming soon.');
            // window.location.href = 'create-event.html';
        });
    }

    if (btnEvents) {
        btnEvents.addEventListener('click', () => {
            alert('Events management page coming soon.');
            // window.location.href = 'events.html';
        });
    }

    if (btnReports) {
        btnReports.addEventListener('click', () => {
            alert('Reports page coming soon.');
            // window.location.href = 'reports.html';
        });
    }
}

// ===== Dashboard Data =====
// This expects an endpoint like GET /dashboard that returns:
// {
//   stats: { totalEvents, totalAttendees, revenue },
//   upcomingEvents: [{ id, name, date, location }]
// }
// For now, if that route doesn't exist, it will just show a friendly error.
async function loadDashboardData() {
    const statEvents = document.getElementById('statTotalEvents');
    const statAttendees = document.getElementById('statTotalAttendees');
    const statRevenue = document.getElementById('statRevenue');
    const upcomingList = document.getElementById('upcomingEventsList');
    const eventsCountLabel = document.getElementById('eventsCountLabel');

    if (!statEvents || !statAttendees || !statRevenue || !upcomingList || !eventsCountLabel) {
        return;
    }

    try {
        const res = await fetch(`${DASHBOARD_API_BASE}/dashboard`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        const stats = data.stats || {};
        const events = data.upcomingEvents || [];

        statEvents.textContent = stats.totalEvents ?? 0;
        statAttendees.textContent = stats.totalAttendees ?? 0;
        statRevenue.textContent = stats.revenue
            ? `$${Number(stats.revenue).toLocaleString()}`
            : '$0';

        eventsCountLabel.textContent = `${events.length} event${events.length === 1 ? '' : 's'}`;

        upcomingList.innerHTML = '';

        if (events.length === 0) {
            upcomingList.innerHTML =
                '<div class="text-muted">No upcoming events. Create one to get started!</div>';
            return;
        }

        events.forEach((event) => {
            const item = document.createElement('a');
            item.href = '#'; // later: link to event details page
            item.className =
                'list-group-item list-group-item-action d-flex justify-content-between align-items-start';

            item.innerHTML = `
                <div class="ms-2 me-auto">
                    <div class="fw-bold">${event.name}</div>
                    <div class="small text-muted">
                        <i class="bi bi-geo-alt"></i> ${event.location || 'TBA'}
                    </div>
                </div>
                <span class="badge bg-primary rounded-pill">
                    ${event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}
                </span>
            `;

            upcomingList.appendChild(item);
        });
    } catch (err) {
        console.error('Error loading dashboard data:', err);
        upcomingList.innerHTML =
            '<div class="text-danger">Dashboard data endpoint not available yet. You can add it on the server later.</div>';
    }
}

