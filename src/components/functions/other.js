const formatBytes = (bytes, decimals = 2) => {
	// If argument is undefined or 0, return 0B rather than running unnecessary code
	if (bytes === 0 || bytes == 'undefined') return '0 B';
	// Size of kilobyte
	const k = 1024;
	// Decimals
	const dm = decimals < 0 ? 0 : decimals;
	// Possible sizes
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
	// Convert
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	// Return result, formatted
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export { formatBytes };
