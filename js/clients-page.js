import { getSignedInUser, signOut } from './session.js';

const CLIENTS_KEY = 'crm_clients';
const page = document.querySelector('#clients-page');
const list = document.querySelector('#client-list');
const statusMessage = document.querySelector('#clients-status');
const retryButton = document.querySelector('#retry-clients');

const dollars = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

function textElement(tag, text, className = '') {
    const element = document.createElement(tag);
    element.textContent = text;
    element.className = className;
    return element;
}

function renderClients(clients) {
    list.replaceChildren();
    statusMessage.textContent = clients.length ? '' : 'No clients found.';

    for (const client of clients) {
        const card = document.createElement('li');
        card.className = 'card client-card';
        card.dataset.id = String(client.id);

        const avatar = document.createElement('img');
        avatar.src = client.image;
        avatar.alt = '';
        avatar.width = 44;
        avatar.height = 44;
        avatar.loading = 'lazy';

        const details = document.createElement('div');
        details.append(
            textElement('h2', client.name),
            textElement('p', client.company || 'Independent', 'muted'),
            textElement('p', client.email, 'muted'),
            textElement('span', client.status, 'client-badge'),
            textElement('p', dollars.format(client.dealValue), 'client-value')
        );

        card.append(avatar, details);
        list.append(card);
    }
}

async function loadClients() {
    retryButton.hidden = true;
    statusMessage.textContent = 'Loading clients...';

    try {
        const savedClients = localStorage.getItem(CLIENTS_KEY);

        if (savedClients !== null) {
            const clients = JSON.parse(savedClients);
            if (!Array.isArray(clients)) {
                throw new Error('Saved clients have an invalid format.');
            }

            renderClients(clients);
            return;
        }

        const response = await fetch('https://dummyjson.com/users?limit=30');
        if (!response.ok) {
            throw new Error(`Client request failed: ${response.status}`);
        }

        const { users } = await response.json();
        const clients = users.map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone ?? '',
            company: user.company?.name ?? '',
            image: user.image,
            status: 'Lead',
            dealValue: 1000,
            notes: [],
            createdAt: new Date().toISOString(),
        }));

        localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
        renderClients(clients);
    } catch {
        statusMessage.textContent =
            'Could not load clients. Check your connection and try again.';
        retryButton.hidden = false;
    }
}

if (!getSignedInUser()) {
    window.location.replace('index.html');
} else {
    page.hidden = false;

    document.querySelector('#logout').addEventListener('click', () => {
        try {
            signOut();
        } catch {
            statusMessage.textContent = 'Could not log out. Please try again.';
        }
    });

    retryButton.addEventListener('click', loadClients);
    void loadClients();
}