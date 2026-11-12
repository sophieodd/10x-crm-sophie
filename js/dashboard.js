const SESSION_KEY = 'crm_session';
const USERS_KEY = 'crm_users';

function getSignedInUser() {
    try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null');
        const users = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');

        if (!session || !Array.isArray(users)) return null;

        return users.find(
            user => user?.id === session.userId && user?.email === session.email
        ) ?? null;
    } catch {
        return null;
    }
}

const user = getSignedInUser();

if (!user) {
    window.location.replace('index.html');
} else {
    document.querySelector('#welcome-heading').textContent =
        `Welcome back, ${user.fullName}.`;

    document.querySelector('#logout').addEventListener('click', () => {
        try {
            localStorage.removeItem(SESSION_KEY);
            window.location.replace('index.html');
        } catch {
            document.querySelector('#dashboard-error').textContent =
                'Could not log out. Please try again.';
        }
    });

    document.querySelector('#dashboard').hidden = false;
}