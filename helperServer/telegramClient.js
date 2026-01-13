// STUB for Telegram Client
export async function createClient(apiId, apiHash, sessionString) {
    console.log('[STUB] Creating Telegram Client');
    return {
        getEntity: async () => ({ id: 123, title: 'Stub Channel', username: 'stub', accessHash: '123' }),
        invoke: async () => ({ fullChat: { participantsCount: 0, about: 'stub' }, chats: [{ title: 'stub', username: 'stub' }] }),
        getMessages: async () => [],
        disconnect: async () => console.log('[STUB] Disconnecting client')
    };
}