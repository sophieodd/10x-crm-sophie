const USERS_KEY = 'crm_users';
const SESSION_KEY = 'crm_session';

const form = document.querySelector('.access-form');
const submitButton = form.querySelector('button[type="submit"]');
const isSignup = document.body.dataset.page === 'signup';
const fields = [...form.querySelectorAll('input')];

const fieldErrors = new Map(
    fields.map(input => {
        const message = document.createElement('p');
        message.id = `${input.id}-error`;
        message.className = 'field-error';
        input.after(message);
        input.setAttribute('aria-describedby', message.id);

        return [input, message];
    })
);

const formError = document.createElement('p');
formError.className = 'form-error';
formError.setAttribute('role', 'alert');
submitButton.before(formError);

const successMessage = document.createElement('p');
successMessage.className = 'auth-success';
successMessage.setAttribute('role', 'status');
form.after(successMessage);

function readUsers() {
    const savedUsers = localStorage.getItem(USERS_KEY);
    const users = savedUsers === null ? [] : JSON.parse(savedUsers);

    if (!Array.isArray(users)) {
        throw new Error('Saved accounts have an invalid format.');
    }

    return users;
}

function validateSignup(values, users) {
    const errors = {};

    if (values.fullName.length < 3) {
        errors.fullName = 'Full name must be at least 3 characters';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Please enter a valid email address';
    } else if (users.some(user => user.email.toLowerCase() === values.email)) {
        errors.email = 'An account with this email already exists';
    }

    if (
        values.password.length < 8 ||
        !/[a-z]/i.test(values.password) ||
        !/\d/.test(values.password)
    ) {
        errors.password =
            'Password must be at least 8 characters and contain a letter and a number';
    }

    if (values.confirmPassword !== values.password) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
}

function validateLogin(values) {
    const errors = {};

    if (!values.email) errors.email = 'Email is required';
    if (!values.password) errors.password = 'Password is required';

    return errors;
}

function showFieldErrors(errors) {
    let firstInvalidInput = null;

    for (const [input, message] of fieldErrors) {
        const error = errors[input.name] ?? '';
        message.textContent = error;
        input.setAttribute('aria-invalid', String(Boolean(error)));

        if (error && firstInvalidInput === null) {
            firstInvalidInput = input;
        }
    }

    firstInvalidInput?.focus();
    return firstInvalidInput !== null;
}

form.addEventListener('submit', event => {
    event.preventDefault();

    if (submitButton.disabled) return;
    formError.textContent = '';

    const data = new FormData(form);
    const values = {
        fullName: String(data.get('fullName') ?? '').trim(),
        email: String(data.get('email') ?? '').trim().toLowerCase(),
        company: String(data.get('company') ?? '').trim(),
        password: String(data.get('password') ?? ''),
        confirmPassword: String(data.get('confirmPassword') ?? ''),
    };

    try {
        if (isSignup) {
            const users = readUsers();
            if (showFieldErrors(validateSignup(values, users))) return;

            const user = {
                id: Date.now(),
                fullName: values.fullName,
                email: values.email,
                company: values.company,
                password: values.password,
                createdAt: new Date().toISOString(),
            };

            localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
            submitButton.disabled = true;
            form.reset();
            successMessage.textContent = 'Account created successfully! Please log in.';
            window.setTimeout(() => window.location.replace('index.html'), 1500);
            return;
        }

        if (showFieldErrors(validateLogin(values))) return;

        const user = readUsers().find(
            account =>
                account.email.toLowerCase() === values.email &&
                account.password === values.password
        );

        if (!user) {
            formError.textContent = 'Invalid email or password';
            return;
        }

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
                userId: user.id,
                email: user.email,
                loginAt: new Date().toISOString(),
            })
        );

        window.location.replace('dashboard.html');
    } catch {
        formError.textContent =
            'Could not read or save account data in this browser. Please try again.';
    }
});

submitButton.disabled = false;