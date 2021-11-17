const getDrives = async () => {
	let driveList = [];
	let nextPageToken;
	let fetchedAll = true;

	while (fetchedAll) {
		const resp = await gapi.client.drive.drives.list({
			pageSize: 100,
			pageToken: nextPageToken,
			field: 'nextPageToken, drives(name, id, hidden, restrictions)'
		});

		driveList = driveList.concat(resp.result.drives);
		if (resp.result.nextPageToken) {
			nextPageToken = resp.result.nextPageToken;
			// If no token, we have all of the files in the particular folder
		} else {
			fetchedAll = false;
		}
	}
	return driveList;
};

const createDrive = () => {};
export { getDrives };
