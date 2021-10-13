import { writable } from 'svelte/store';

// OAuth client variables
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly profile';

// Our current folder variables, these change every page
const folderId = writable('');
const currentFolder = writable({
	loaded: false,
	folderName: '',
	directorySize: 0,
	fileCount: 0,
	fileList: [],
	parentId: ''
});
const currentDrives = writable({
	load: false,
	loaded: false,
	driveList: []
});
// other variables
const isAuthenticated = writable(false);
const message = writable('');

export { DISCOVERY_DOCS, SCOPES, folderId, currentFolder, currentDrives, isAuthenticated, message };
