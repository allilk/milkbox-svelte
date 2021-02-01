import {api_key, client_id, discovery_docs, scopes, people_id} from './stores';

export default class initClient{
    constructor() {
        return (async () => {
            await this.init()
            return this.PEOPLE_ID;
        })(); 
    };
    async init() {
        gapi.load('client:auth2', this.onLoadCallback.bind(this));
    }
    async onLoadCallback() {
		const authorizeButton = document.getElementById('authorize_button');
		const signoutButton = document.getElementById('signout_button');
        const refreshButton = document.getElementById('refresh_button');
        async function handleAuthClick(event) {
            gapi.auth2.getAuthInstance().signIn();
        };
        async function handleSignoutClick(event) {
            gapi.auth2.getAuthInstance().signOut();
        };
        async function getPeopleId() {
            let resp = await gapi.client.people.people.get({
                'resourceName': 'people/me',
                'requestMask.includeField': 'person.names'
            });
            let peopleId = ((resp.result.resourceName).split('people/')[1]);
            people_id.set(peopleId)
        };
        async function updateSigninStatus(isSignedIn) {
            if (isSignedIn) {
                authorizeButton.style.display = 'none';
                signoutButton.style.display = 'block';
                refreshButton.style.display = 'block';
            } else {
                authorizeButton.style.display = 'block';
                signoutButton.style.display = 'none';
                refreshButton.style.display = 'none';
            };
        };
        await gapi.client.init({
            cookiepolicy: 'single_host_origin',
            apiKey: api_key,
            clientId: client_id,
            discoveryDocs: discovery_docs,
            scope: scopes
        }).then(async function () {
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
        }, function(error) {
            console.log(JSON.stringify(error, null, 2));
        });
        this.PEOPLE_ID = await getPeopleId();
    };
};
