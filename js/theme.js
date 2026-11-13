const THEME_KEY = 'crm_theme';
const root = document.documentElement;

function getSavedTheme() {
    try {
        return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
}

root.dataset.theme = getSavedTheme();

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('#theme-toggle');
    if (!toggle) return;

    function updateToggle() {
        toggle.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
    }

    updateToggle();

    toggle.addEventListener('click', () => {
        const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        root.dataset.theme = nextTheme;
        updateToggle();

        try {
            localStorage.setItem(THEME_KEY, nextTheme);
        } catch {
            // The theme still works on this page if storage is unavailable.
        }
    });
});