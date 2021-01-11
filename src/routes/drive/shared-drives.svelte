<script>
    import { afterUpdate, beforeUpdate } from 'svelte';
    import db from './connection';


	const setLoading = async () => {
		let loadingIcon = document.getElementById('#loading');
		loadingIcon.style = "";
		let Content = document.getElementById("content-list");
		Content.style = "display: none;";
		}
	beforeUpdate(async () => {
        setLoading();
	});
    afterUpdate(async () => {
		const authorizeButton = document.getElementById('authorize_button');
		const signoutButton = document.getElementById('signout_button');
		const refreshButton = document.getElementById('refresh_button');
        
        let PEOPLE_ID;
        let REFRESH = false;

        async function refreshContent(){
			REFRESH = true;
			setLoading().then(async function(res) {
				listDrives();
			});
		}
        function handleClientLoad() {
            gapi.load('client:auth2', onLoadCallback);
            }
        function onLoadCallback() {
            gapi.client.init({
            cookiepolicy: 'single_host_origin',
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
            }).then(function () {
            // console.log(gapi.auth2.GoogleAuth.currentUser.get())
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
                
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
            refreshButton.onclick = refreshContent;
            }, function(error) {
            console.log(JSON.stringify(error, null, 2));
            });
        }
        function updateSigninStatus(isSignedIn) {
            if (isSignedIn) {
            authorizeButton.style.display = 'none';
            signoutButton.style.display = 'block';
            refreshButton.style.display = 'block';
            gapi.client.people.people.get({
				'resourceName': 'people/me',
				'requestMask.includeField': 'person.names'
			}).then(function(resp) {
                PEOPLE_ID = (resp.result.resourceName).split('people/')[1];
                listDrives();
            });
            

            } else {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
            refreshButton.style.display = 'none';
            }
        }
        function handleAuthClick(event) {
            gapi.auth2.getAuthInstance().signIn();
        }
        function handleSignoutClick(event) {
            gapi.auth2.getAuthInstance().signOut();
            }
        async function listDrives() {
            async function checkForCache(){
                if (REFRESH) {
					await db.drives.where({
						'peopleid': PEOPLE_ID,
					}).delete()
				}
                let cacheExists = false;
                let ifCache = await db.drives.where('peopleid').equals(PEOPLE_ID).toArray();
                if (ifCache.length > 0) {cacheExists = true;};
				return cacheExists;
            };
            let fetchDrives = true;
            let nextPageToken;
            let driveList = [];
            checkForCache().then(async function(res){
                if (res == false) {
                    while (fetchDrives) {
                        await gapi.client.drive.drives.list({
                            'pageSize': 100,
                            'pageToken': nextPageToken
                        }).then(function(response){
                            driveList.push(response.result.drives)
                            if (!response.result.nextPageToken){
                                fetchDrives = false;
                            } else {
                                nextPageToken = response.result.nextPageToken;
                            };
                        });
                    };
                    driveList = [].concat.apply([], driveList);
                    for (let i = 0; i < driveList.length; i++){
                        let drive = driveList[i];
                        await db.drives.put({
                            name: drive.name, id: drive.id, peopleid: PEOPLE_ID,
                        });
                    }
                }
            }).then(async function (){
                await loadContent();
            });

            
        }
        async function loadContent() {
            let driveList = await db.drives.where('peopleid').equals(PEOPLE_ID).toArray();

            let oldContent = document.getElementById('content-list');
            oldContent.innerHTML = '';

            let loadingIcon = document.getElementById('#loading');
            loadingIcon.style = 'display: none;';

            for (let i = 0; i < driveList.length; i++){
                let divElement = document.createElement('div');
                divElement.setAttribute("class", "col-span-4 md:col-span-2 align-middle py-1 pl-0");
                let drive = driveList[i];
                let newObj = document.createElement("a");
                let newContent = document.createTextNode(drive.name);
                newObj.href = `drive/${drive.id}`;
				newObj.appendChild(newContent);

                newObj.innerHTML = "<span class='drive-obj'>" + newObj.innerHTML + ` <span id="file" class="text-xs text-gray-500">(${drive.id})</span></span>\n`;
                divElement.appendChild(newObj);
                oldContent.appendChild(divElement);
                
            };
            let totalDrives = document.getElementById('total-drives');
            totalDrives.innerText = `(${driveList.length})`;
        }
        handleClientLoad();
    });
		
</script>



    <div class="top-header shadow-2xl px-8 py-16 sm:py-12 ">
        <span id="index-header" class="text-2xl">my shared drives <span id="total-drives" class=" text-gray-500"></span></span>
        <br><hr>
        quick links: 
        <a href="drive/root">
            <button class="font-semibold px-2 py-2 rounded-none shadow">my drive</button>
        </a>
        <a href="drive/shared-with-me" >
            <button class="font-semibold px-2 py-2 rounded-none shadow">shared with me</button>
        </a>
        <a href="drive/shared-drives">
            <button class="font-semibold px-2 py-2 rounded-none shadow">shared drives</button>
        </a>
        <br>
    </div>
    <div class="px-2 shadow-inner whitespace-nowrap overflow-x-hidden">
        <div class="inline-flex space-y-4">
            <button id="authorize_button" style="display: none;" class="font-semibold px-2 py-2 rounded-none shadow">
                Authorize</button>
            <button id="signout_button" style="display: none;" class="font-semibold px-2 py-2 rounded-none shadow">
                Sign Out</button>
            <button id="refresh_button" style="display: none;" class="font-semibold px-2 py-2 rounded-none shadow">
                Refresh</button>
        </div>
        <div class="grid grid-cols-4 text-sm sticky">
            
            <div id="sort-name" class="col-span-4 font-bold py-3 animation-pulse">Name</div>
            <div id="#loading" class="col-span-full">
                <center>
                    <div class="lds-ripple"><div></div><div></div></div>
                </center>
            </div>
        </div>
        <div id="content-list" class="grid grid-cols-4 text-sm">
        
        </div>
    </div>