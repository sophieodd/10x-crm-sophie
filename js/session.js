export const SESSION_KEY = 'crm_session';
const USERS_KEY = 'crm_users';

export function getSignedInUser() {
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

export function signOut() {
    localStorage.removeItem(SESSION_KEY);
    window.location.replace('index.html');
}