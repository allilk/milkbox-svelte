const getFiles = async (identifier) => {
	let fileList = [];
	// Declare empty page token
	let nextPageToken;
	// If more files need to be fetched, this gets set to false.
	let fetchedAll = true;
	// Loop until we have all of the files
	while (fetchedAll) {
		// Call API for our files
		const resp = await gapi.client.drive.files.list({
			// We only want files that actually exist, in the future, there will be multiple options for queries
			q: `'${identifier}' in parents and trashed=false`,
			pageSize: 1000,
			supportsAllDrives: true,
			includeItemsFromAllDrives: true,
			corpora: 'allDrives',
			fields:
				'nextPageToken, files(name, id, parents, size, mimeType, modifiedTime, driveId, webViewLink, thumbnailLink, shortcutDetails)',
			// This saves us time later
			orderBy: 'folder,name',
			pageToken: nextPageToken
		});
		// Concat to the master list
		fileList = fileList.concat(resp.result.files);

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
	// Get parent object from API
	const resp = await gapi.client.drive.files.get({
		fileId: identifier,
		supportsAllDrives: true,
		includeItemsFromAllDrives: true,
		fields: 'name, id, parents, driveId'
	});
	// Declare the driveId
	const driveId = resp.result.driveId;
	// If driveId exists and identifier is less than 30, this is a shared drive.
	if (driveId && identifier < 30) {
		parentId = 'shared-drives';
	} else {
		// If no parent, this is shared with me
		if (resp.result.parents === undefined) {
			parentId = 'shared-with-me';
			// Otherwise, this is just a normal file in a folder, so return the proper id.
		} else {
			parentId = resp.result.parents[0];
		}
	}
	return {
		name: resp.result.name,
		id: parentId
	};
};

export { getFiles, getParent };
