import { getSignedInUser, signOut } from './session.js';
import { getClients } from './client-store.js';

const dashboard = document.querySelector('#dashboard');
const clock = document.querySelector('#dashboard-clock');
const statusMessage = document.querySelector('#dashboard-status');
const retryButton = document.querySelector('#dashboard-retry');
const dataPanel = document.querySelector('#dashboard-data');
const pipeline = document.querySelector('#pipeline');
const recentList = document.querySelector('#recent-clients');

const statuses = ['Lead', 'Contacted', 'Won', 'Lost'];
const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
const dollars = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

function textElement(tag, text, className = '') {
    const element = document.createElement(tag);
    element.textContent = text;
    element.className = className;
    return element;
}

function updateClock() {
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = `${now.toLocaleDateString()} · ${now.toLocaleTimeString()}`;
}

function renderDashboard(clients) {
    const now = Date.now();
    const wonClients = clients.filter(client => client.status === 'Won');
    const activeDeals = clients.filter(
        client => client.status === 'Lead' || client.status === 'Contacted'
    );
    const newThisWeek = clients.filter(client => {
        const createdAt = Date.parse(client.createdAt);
        return createdAt >= now - weekInMilliseconds && createdAt <= now;
    });

    document.querySelector('#total-clients').textContent = clients.length;
    document.querySelector('#active-deals').textContent = activeDeals.length;
    document.querySelector('#won-revenue').textContent = dollars.format(
        wonClients.reduce((sum, client) => sum + Number(client.dealValue), 0)
    );
    document.querySelector('#new-this-week').textContent = newThisWeek.length;

    pipeline.replaceChildren();

    for (const status of statuses) {
        const row = document.createElement('div');
        row.classList.add('pipeline-status');
        row.dataset.status = status;

        const count = clients.filter(client => client.status === status).length;
        row.append(textElement('dt', status), textElement('dd', count));
        pipeline.append(row);
    }

    const recentClients = [...clients]
        .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
        .slice(0, 5);

    recentList.replaceChildren();

    if (recentClients.length === 0) {
        recentList.append(textElement('li', 'No clients found.', 'muted'));
    }

    for (const client of recentClients) {
        const row = document.createElement('li');
        const details = [client.company, new Date(client.createdAt).toLocaleDateString()]
            .filter(Boolean)
            .join(' · ');

        row.append(
            textElement('strong', client.name),
            textElement('span', client.status, 'client-badge'),
            textElement('span', details, 'dashboard-client-meta muted')
        );

        recentList.append(row);
    }
}

async function loadDashboard() {
    retryButton.hidden = true;
    dataPanel.hidden = true;
    statusMessage.textContent = 'Loading clients...';

    try {
        renderDashboard(await getClients());
        statusMessage.textContent = '';
        dataPanel.hidden = false;
    } catch {
        statusMessage.textContent =
            'Could not load clients. Check your connection and try again.';
        retryButton.hidden = false;
    }
}

const user = getSignedInUser();

if (!user) {
    window.location.replace('index.html');
} else {
    const firstName = user.fullName.trim().split(/\s+/)[0];
    document.querySelector('#welcome-heading').textContent =
        `Welcome back, ${firstName}!`;

    document.querySelector('#logout').addEventListener('click', () => {
        try {
            signOut();
        } catch {
            document.querySelector('#dashboard-error').textContent =
                'Could not log out. Please try again.';
        }
    });

    dashboard.hidden = false;
    updateClock();
    const clockTimer = window.setInterval(updateClock, 1000);
    window.addEventListener('pagehide', event => {
        if (!event.persisted) window.clearInterval(clockTimer);
    });

    retryButton.addEventListener('click', loadDashboard);
    window.addEventListener('pageshow', event => {
        if (!event.persisted) return;

        if (!getSignedInUser()) {
            window.location.replace('index.html');
            return;
        }

        void loadDashboard();
    });

    void loadDashboard();
}