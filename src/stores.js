import { writable } from 'svelte/store';

const CLIENT_ID = '';
const API_KEY = '';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly profile';
const folderId = writable('');
const directorySize = writable(0);
const fileCount = writable(0);
const fileList = writable([]);
const isAuthenticated = writable(false);
const message = writable('');

export {
	CLIENT_ID,
	API_KEY,
	DISCOVERY_DOCS,
	SCOPES,
	folderId,
	directorySize,
	fileCount,
	fileList,
	isAuthenticated,
	message
};
