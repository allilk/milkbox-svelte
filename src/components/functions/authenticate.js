import { DISCOVERY_DOCS, SCOPES, isAuthenticated } from '../../stores';

class initClient {
	async initiate() {
		// Create gapi script tag and set our callback to load gapi
		const gapiScript = document.createElement('script');
		gapiScript.src = 'https://apis.google.com/js/platform.js';
		gapiScript.onload = async () => {
			await gapi.load('client:auth2', this.load);
		};
		// Add to document body
		document.body.appendChild(gapiScript);
	}

	async load() {
		// Get our authentication button (Login/Logout)
		const authButton = document.getElementById('authButton');

		const handleAuth = () => {
			// If logged out, login & vice versa
			isAuthenticated.subscribe((auth) => {
				if (!auth) {
					gapi.auth2.getAuthInstance().signIn();
				} else {
					gapi.auth2.getAuthInstance().signOut();
				}
			})();
		};

		const updateSigninStatus = async (isSignedIn) => {
			// Update the sign in status store
			if (isSignedIn) {
				isAuthenticated.set(true);
			} else {
				isAuthenticated.set(false);
			}
		};

		// Initiate our oauth client
		await gapi.client.init({
			cookiepolicy: 'single_host_origin',
			apiKey: import.meta.env.VITE_API_KEY,
			clientId: import.meta.env.VITE_CLIENT_ID,
			discoveryDocs: DISCOVERY_DOCS,
			scope: SCOPES
		});
		// Update signin status
		await gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
		updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
		// Set our authbutton onclick to handle the auth
		authButton.onclick = handleAuth;
	}
}

export default initClient;
