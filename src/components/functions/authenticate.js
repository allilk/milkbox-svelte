import { CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES, isAuthenticated } from '../../stores';

class initClient {
	async initiate() {
		const gapiScript = document.createElement('script');
		gapiScript.src = 'https://apis.google.com/js/platform.js';
		gapiScript.onload = async () => {
			await gapi.load('client:auth2', this.load);
		};
		document.body.appendChild(gapiScript);
	}
	async load() {
		const authButton = document.getElementById('authButton');
		const handleAuth = () => {
			isAuthenticated.subscribe((auth) => {
				if (!auth) {
					gapi.auth2.getAuthInstance().signIn();
				} else {
					gapi.auth2.getAuthInstance().signOut();
				}
			})();
		};
		const updateSigninStatus = async (isSignedIn) => {
			if (isSignedIn) {
				isAuthenticated.set(true);
			} else {
				isAuthenticated.set(false);
			}
		};
		await gapi.client.init({
			cookiepolicy: 'single_host_origin',
			apiKey: API_KEY,
			clientId: CLIENT_ID,
			discoveryDocs: DISCOVERY_DOCS,
			scope: SCOPES
		});
		await gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
		updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
		authButton.onclick = handleAuth;
	}
}

export default initClient;
