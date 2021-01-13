import { readable, writable } from 'svelte/store';

export const client_id = readable(
    ''
);
export const api_key = readable(
    ''
);
export const discovery_docs = readable(
    ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest","https://people.googleapis.com/$discovery/rest?version=v1"]
);
export const scopes = readable(
    'https://www.googleapis.com/auth/drive.readonly profile'
);