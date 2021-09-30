const getFiles = async (identifier) => {
	let fileList = [];
	// Declare empty page token
	let nextPageToken;
	// If more files need to be fetched, this gets set to false.
	let fetchedAll = true;

	let query = `'${identifier}' in parents and trashed=false`;
	if (identifier == 'shared-with-me') {
		query = 'sharedWithMe';
	}
	// Loop until we have all of the files
	while (fetchedAll) {
		// Call API for our files
		const resp = await gapi.client.drive.files.list({
			q: query,
			pageSize: 1000,
			supportsAllDrives: true,
			includeItemsFromAllDrives: true,
			corpora: 'allDrives',
			fields:
				'nextPageToken, files(name, id, parents, size, mimeType, modifiedTime, driveId, webViewLink, thumbnailLink, shortcutDetails)',
			// This saves us time later
			orderBy: 'folder,name_natural',
			pageToken: nextPageToken
		});
		// Concat to the master list
		fileList = fileList.concat(resp.result.files);
		console.log(fileList);
		// If there is a nextPageToken, we need to pass it in to our API call to get the next batch of results.
		if (resp.result.nextPageToken) {
			nextPageToken = resp.result.nextPageToken;
			// If no token, we have all of the files in the particular folder
		} else {
			fetchedAll = false;
		}
	}
	// return the list of files we fetched
	return fileList;
};
const getParent = async (identifier) => {
	// Declare fallback parent
	let parentId = 'root';
	// If shared with me, return root
	if (identifier == 'shared-with-me') return { name: 'Shared With Me', id: parentId };
	// Get parent object from API
	const resp = await gapi.client.drive.files.get({
		fileId: identifier,
		supportsAllDrives: true,
		includeItemsFromAllDrives: true,
		fields: 'name, id, parents, driveId, shared, sharedWithMeTime'
	});
	const file = resp.result;
	// Declare the driveId
	const driveId = file.driveId;

	// If driveId exists and identifier is less than 30, this is a shared drive.
	if (driveId && identifier < 30) {
		// Shared Drive
		parentId = 'shared-drives';
	} else if (file.shared && file.sharedWithMeTime) {
		// Shared With Me
		parentId = 'shared-with-me';
	} else if (file.parents) {
		// Normal folder
		parentId = file.parents[0];
	}
	return {
		name: resp.result.name,
		id: parentId
	};
};

export { getFiles, getParent };
