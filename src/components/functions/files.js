const getFiles = async (identifier) => {
	let nextPageToken;
	let fileList = [];
	let fetchedAll = true;

	while (fetchedAll) {
		const resp = await gapi.client.drive.files.list({
			q: `'${identifier}' in parents and trashed=false`,
			pageSize: 1000,
			supportsAllDrives: true,
			includeItemsFromAllDrives: true,
			corpora: 'allDrives',
			fields:
				'nextPageToken, files(name, id, parents, size, mimeType, modifiedTime, driveId, webViewLink, thumbnailLink, shortcutDetails)',
			orderBy: 'folder,name',
			pageToken: nextPageToken
		});
		fileList = fileList.concat(resp.result.files);

		if (resp.result.nextPageToken) {
			nextPageToken = resp.result.nextPageToken;
		} else {
			fetchedAll = false;
		}
	}
	return fileList;
};
const getParent = async (identifier) => {
	let parentId = 'root';
	const resp = await gapi.client.drive.files.get({
		fileId: identifier,
		supportsAllDrives: true,
		includeItemsFromAllDrives: true,
		fields: 'name, id, parents, driveId'
	});

	const driveId = resp.result.driveId;
	if (driveId && identifier < 30) {
		parentId = 'shared-drives';
	} else {
		if (resp.result.parents === undefined) {
			parentId = 'shared-with-me';
		} else {
			parentId = resp.result.parents[0];
		}
	}
	return parentId;
};

export { getFiles, getParent };
