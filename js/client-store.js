export const CLIENTS_KEY = 'crm_clients';
export const USERS_ENDPOINT = 'https://dummyjson.com/users';

export async function getClients() {
    const savedClients = localStorage.getItem(CLIENTS_KEY);

    if (savedClients !== null) {
        const clients = JSON.parse(savedClients);

        if (!Array.isArray(clients)) {
            throw new Error('Saved clients have an invalid format.');
        }

        return clients;
    }

    const response = await fetch(`${USERS_ENDPOINT}?limit=30`);

    if (!response.ok) {
        throw new Error(`Client request failed: ${response.status}`);
    }

    const { users } = await response.json();
    const createdAt = new Date().toISOString();

    const clients = users.map(user => ({
        id: user.id,
        apiId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone ?? '',
        company: user.company?.name ?? '',
        image: user.image ?? '',
        status: 'Lead',
        dealValue: 1000,
        notes: [],
        createdAt,
    }));

    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    return clients;
}