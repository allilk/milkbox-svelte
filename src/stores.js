import { writable } from 'svelte/store';

const CLIENT_ID = '';
const API_KEY = '';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly profile';

const isAuthenticated = writable(false);
const message = writable('');

const folderId = writable('');
const currentFolder = writable({
	folderName: '',
	directorySize: 0,
	fileCount: 0,
	fileList: [],
	parentId: ''
});
export {
	CLIENT_ID,
	API_KEY,
	DISCOVERY_DOCS,
	SCOPES,
	isAuthenticated,
	message,
	folderId,
	currentFolder
};
