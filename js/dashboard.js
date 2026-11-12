import { getSignedInUser, SESSION_KEY } from './session.js';

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