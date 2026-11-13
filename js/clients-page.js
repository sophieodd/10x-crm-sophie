import { getSignedInUser, signOut } from './session.js';
import { CLIENTS_KEY, USERS_ENDPOINT, getClients } from './client-store.js';

const CLIENT_STATUSES = ['Lead', 'Contacted', 'Won', 'Lost'];
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_LOGO_BYTES = 256 * 1024;

const page = document.querySelector('#clients-page');
const list = document.querySelector('#client-list');
const statusMessage = document.querySelector('#clients-status');
const retryButton = document.querySelector('#retry-clients');
const addButton = document.querySelector('#open-client-dialog');
const dialog = document.querySelector('#client-dialog');
const dialogTitle = dialog.querySelector('h1, h2, h3, h4, h5, h6');
const closeButton = document.querySelector('#close-client-dialog');
const form = document.querySelector('#client-form');
const saveButton = form.querySelector('button[type="submit"]');
const formError = document.querySelector('#client-form-error');
const toast = document.querySelector('#client-toast');

const addDialogTitle = dialogTitle?.textContent ?? 'Add Client';
const addButtonText = saveButton.textContent;

let clients = [];
let editingClientId = null;
let toastTimer;

const dollars = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
});

function textElement(tag, text, className = '') {
    const element = document.createElement(tag);
    element.textContent = text;
    element.className = className;
    return element;
}

const logoField = document.createElement('div');
const logoLabel = textElement('label', 'Company logo (optional)');
logoLabel.htmlFor = 'client-company-logo';

const logoInput = document.createElement('input');
logoInput.type = 'file';
logoInput.id = 'client-company-logo';
logoInput.accept = LOGO_TYPES.join(',');
logoInput.setAttribute('aria-describedby', 'client-logo-hint client-logo-error');

const logoHint = textElement('small', '', 'muted');
logoHint.id = 'client-logo-hint';

const logoError = textElement('p', '', 'form-error');
logoError.id = 'client-logo-error';
logoError.setAttribute('role', 'alert');

logoField.append(logoLabel, logoInput, logoHint, logoError);

const companyField = form.elements.namedItem('company').closest('div');

if (companyField && form.contains(companyField)) {
    companyField.after(logoField);
} else {
    form.prepend(logoField);
}

function saveClients(nextClients) {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(nextClients));
    clients = nextClients;
}

function renderClients() {
    list.replaceChildren();
    statusMessage.textContent = clients.length ? '' : 'No clients found.';

    for (const client of clients) {
        const card = document.createElement('li');
        card.className = 'card client-card';
        card.dataset.id = String(client.id);

        if (client.image) {
            const avatar = document.createElement('img');
            avatar.src = client.image;
            avatar.alt = '';
            avatar.width = 44;
            avatar.height = 44;
            avatar.loading = 'lazy';
            card.append(avatar);
        }

        const details = document.createElement('div');

        if (!client.image) {
            details.style.gridColumn = '1 / -1';
        }

        const company = textElement(
            'p',
            client.company || 'Independent',
            'client-company muted'
        );

        if (client.companyLogo) {
            const logo = document.createElement('img');
            logo.className = 'client-company__logo';
            logo.src = client.companyLogo;
            logo.alt = '';
            logo.width = 28;
            logo.height = 28;
            logo.loading = 'lazy';
            company.prepend(logo);
        }

        const statusSelect = document.createElement('select');
        statusSelect.className = 'client-badge client-status-select';
        statusSelect.setAttribute('aria-label', `Change status for ${client.name}`);

        for (const status of CLIENT_STATUSES) {
            statusSelect.add(new Option(status, status));
        }

        statusSelect.value = client.status;
        statusSelect.dataset.status = client.status;

        statusSelect.addEventListener('change', () => {
            const nextStatus = statusSelect.value;

            try {
                saveClients(clients.map(item =>
                    item.id === client.id ? { ...item, status: nextStatus } : item
                ));

                statusSelect.dataset.status = nextStatus;
                statusMessage.textContent = '';
            } catch {
                statusSelect.value = statusSelect.dataset.status;
                statusMessage.textContent =
                    'Could not update the client status. Please try again.';
            }
        });

        details.append(
            textElement('h2', client.name),
            company,
            textElement('p', client.email, 'muted'),
            statusSelect,
            textElement('p', dollars.format(client.dealValue), 'client-value')
        );

        const editButton = textElement('button', 'Edit', 'quiet');
        editButton.type = 'button';
        editButton.setAttribute('aria-label', `Edit ${client.name}`);
        editButton.addEventListener('click', () => openClientDialog(client.id));

        const deleteButton = textElement('button', 'Delete', 'client-delete');
        deleteButton.type = 'button';
        deleteButton.dataset.id = String(client.id);
        deleteButton.setAttribute('aria-label', `Delete ${client.name}`);
        deleteButton.addEventListener('click', () => deleteClient(client, deleteButton));

        const actions = document.createElement('div');
        actions.className = 'client-card__actions';
        actions.append(editButton, deleteButton);

        card.append(details, actions);
        list.append(card);
    }
}

async function loadClients() {
    addButton.disabled = true;
    retryButton.hidden = true;
    statusMessage.textContent = 'Loading clients...';

    try {
        clients = await getClients();
        renderClients();
        addButton.disabled = false;
    } catch {
        statusMessage.textContent =
            'Could not load clients. Check your connection and try again.';
        retryButton.hidden = false;
    }
}

function showClientErrors(errors) {
    for (const message of form.querySelectorAll('[data-error]')) {
        const fieldName = message.dataset.error;
        const error = errors[fieldName] ?? '';

        message.textContent = error;
        form.elements.namedItem(fieldName)
            .setAttribute('aria-invalid', String(Boolean(error)));
    }

    const firstField = Object.keys(errors)[0];

    if (firstField) {
        form.elements.namedItem(firstField)?.focus();
    }
}

function openClientDialog(clientId = null) {
    const client = clients.find(item => item.id === clientId);
    editingClientId = client?.id ?? null;

    form.reset();
    showClientErrors({});
    formError.textContent = '';
    logoError.textContent = '';
    logoInput.removeAttribute('aria-invalid');

    if (dialogTitle) {
        dialogTitle.textContent = client ? 'Edit Client' : addDialogTitle;
    }

    saveButton.textContent = client ? 'Save Changes' : addButtonText;
    logoHint.textContent = client?.companyLogo
        ? 'Choose a new image to replace the current logo. PNG, JPG or WebP, up to 256 KB.'
        : 'PNG, JPG or WebP, up to 256 KB.';

    if (client) {
        for (const field of ['name', 'email', 'phone', 'company', 'dealValue', 'status']) {
            form.elements.namedItem(field).value = client[field] ?? '';
        }
    }

    dialog.showModal();
}

function readLogo(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result));
        reader.addEventListener('error', () => reject(reader.error));
        reader.readAsDataURL(file);
    });
}

function showClientToast(message) {
    window.clearTimeout(toastTimer);
    toast.hidden = false;
    toast.textContent = message;

    toastTimer = window.setTimeout(() => {
        toast.hidden = true;
        toast.textContent = '';
    }, 3000);
}

async function deleteClient(client, button) {
    if (!window.confirm('Delete this client? This cannot be undone.')) return;

    button.disabled = true;

    try {
        const apiId = client.apiId ?? client.id;
        const response = await fetch(
            `${USERS_ENDPOINT}/${encodeURIComponent(apiId)}`,
            { method: 'DELETE' }
        );

        // DummyJSON can return 404 for clients created through its mock API.
        if (!response.ok && response.status !== 404) {
            throw new Error(`Delete request failed: ${response.status}`);
        }

        saveClients(clients.filter(item => item.id !== client.id));
        renderClients();
        showClientToast('Client deleted');
    } catch {
        statusMessage.textContent = 'Could not delete the client. Please try again.';
    } finally {
        button.disabled = false;
    }
}

async function saveClientForm(event) {
    event.preventDefault();
    if (saveButton.disabled) return;

    formError.textContent = '';
    logoError.textContent = '';
    logoInput.removeAttribute('aria-invalid');

    const clientId = editingClientId;
    const isEditing = clientId !== null;
    const fields = new FormData(form);
    const name = String(fields.get('name') ?? '').trim();
    const email = String(fields.get('email') ?? '').trim().toLowerCase();
    const phone = String(fields.get('phone') ?? '').trim();
    const company = String(fields.get('company') ?? '').trim();
    const dealValue = Number(fields.get('dealValue'));
    const status = String(fields.get('status') ?? 'Lead');
    const logoFile = logoInput.files[0];
    const errors = {};

    if (name.length < 3) {
        errors.name = 'Name must be at least 3 characters';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address';
    } else if (clients.some(client =>
        client.id !== clientId && client.email.toLowerCase() === email
    )) {
        errors.email = 'A client with this email already exists';
    }

    if (phone && phone.length < 6) {
        errors.phone = 'Phone number looks too short';
    }

    if (!Number.isFinite(dealValue) || dealValue <= 0) {
        errors.dealValue = 'Deal value must be a positive number';
    }

    if (logoFile && (
        !LOGO_TYPES.includes(logoFile.type) || logoFile.size > MAX_LOGO_BYTES
    )) {
        logoError.textContent = 'Choose a PNG, JPG or WebP image up to 256 KB.';
        logoInput.setAttribute('aria-invalid', 'true');
    }

    showClientErrors(errors);
    if (Object.keys(errors).length) return;

    if (logoError.textContent) {
        logoInput.focus();
        return;
    }

    if (!CLIENT_STATUSES.includes(status)) {
        formError.textContent = 'Select a valid status.';
        form.elements.namedItem('status').focus();
        return;
    }

    saveButton.disabled = true;
    closeButton.disabled = true;

    try {
        const values = { name, email, phone, company, status, dealValue };

        if (logoFile) {
            values.companyLogo = await readLogo(logoFile);
        }

        if (isEditing) {
            if (!clients.some(client => client.id === clientId)) {
                formError.textContent = 'This client is no longer in the list.';
                return;
            }

            saveClients(clients.map(client =>
                client.id === clientId ? { ...client, ...values } : client
            ));
        } else {
            const [firstName, ...remainingNames] = name.split(/\s+/);
            const response = await fetch(`${USERS_ENDPOINT}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName,
                    lastName: remainingNames.join(' '),
                    email,
                    phone,
                    company: { name: company },
                }),
            });

            if (!response.ok) {
                throw new Error(`Client request failed: ${response.status}`);
            }

            const savedUser = await response.json();
            const apiId = savedUser.id;

            if (!Number.isSafeInteger(apiId)) {
                throw new Error('The API did not return a valid client ID.');
            }

            const id = clients.some(client => client.id === apiId)
                ? `local-${crypto.randomUUID()}`
                : apiId;

            const client = {
                ...values,
                id,
                apiId,
                image: savedUser.image ?? '',
                notes: [],
                createdAt: new Date().toISOString(),
            };

            saveClients([client, ...clients]);
        }

        dialog.close();
        renderClients();
        showClientToast(isEditing ? 'Client updated ✓' : 'Client added ✓');
    } catch {
        formError.textContent = isEditing
            ? 'Could not save the changes. Please try again.'
            : 'Could not add the client. Please try again.';
    } finally {
        saveButton.disabled = false;
        closeButton.disabled = false;
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
    addButton.addEventListener('click', () => openClientDialog());
    closeButton.addEventListener('click', () => dialog.close());
    form.addEventListener('submit', saveClientForm);

    dialog.addEventListener('cancel', event => {
        if (saveButton.disabled) event.preventDefault();
    });

    void loadClients();
}