import {api_key, client_id, discovery_docs, scopes} from './stores';

export default class initClient{
    constructor() {
        this.PEOPLE_ID;
        this.isAuth = false;
        this.handleClientLoad();
    };
    async onLoadCallback() {
		const authorizeButton = document.getElementById('authorize_button');
		const signoutButton = document.getElementById('signout_button');
        const refreshButton = document.getElementById('refresh_button');
        let peopleId;
        let isAuth = false;
        async function handleAuthClick(event) {
            gapi.auth2.getAuthInstance().signIn();
        };
        async function handleSignoutClick(event) {
            gapi.auth2.getAuthInstance().signOut();
        };
        async function getPeopleId() {
            let people_id = await gapi.client.people.people.get({
                'resourceName': 'people/me',
                'requestMask.includeField': 'person.names'
            })
            peopleId = ((people_id.result.resourceName).split('people/')[1])
        };
        async function updateSigninStatus(isSignedIn) {
            if (isSignedIn) {
                authorizeButton.style.display = 'none';
                signoutButton.style.display = 'block';
                refreshButton.style.display = 'block';
                isAuth = true;              
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
            await getPeopleId();
            // refreshButton.onclick = this.refreshContent;
        }, function(error) {
            console.log(JSON.stringify(error, null, 2));
        });
        this.isAuth = isAuth;
        this.PEOPLE_ID = peopleId;
    };

    handleClientLoad() {
        gapi.load('client:auth2', this.onLoadCallback.bind(this));
    };
};
