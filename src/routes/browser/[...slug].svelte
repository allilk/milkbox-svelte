<script context="module">
	
	export async function preload(page, folder_id) {
		const { slug } = page.params;
		folder_id = slug;
		return { folder_id };
	}

</script>
<script type="text/javascript">
	export let folder_id;
	import db from './connection';
	import { afterUpdate, beforeUpdate } from 'svelte';
	import loading from 'images/loading.gif';
	
	const CLIENT_ID = process.env.CLIENT_ID;
	const API_KEY = process.env.API_KEY
	const DISCOVERY_DOCS = JSON.parse(process.env.DISCOVERY_DOCS);
	const SCOPES = process.env.SCOPES;
	async function setLoading(){
			let loadingIcon = document.getElementById('#loading');
			loadingIcon.style = "";
			let Content = document.getElementById("#content");
			Content.style = "display: none;";
		}
	beforeUpdate(async () => {
		setLoading();
	});
	afterUpdate(async () => {
		let FOLDER_ID = folder_id[0];
		let PEOPLE_ID;
		let REFRESH = false;

		const authorizeButton = document.getElementById('authorize_button');
		const signoutButton = document.getElementById('signout_button');
		const refreshButton = document.getElementById('refresh_button');
		
		function handleClick(e) {
			e.preventDefault();
		}
		async function downloadFile(fileId){
			let theFile = await gapi.client.drive.files.get({
				'fileId':fileId,
				'supportsAllDrives':true,
				'includeItemsFromAllDrives':true,
				'fields': "webContentLink",
			})
			window.location.href = theFile.result.webContentLink;
		}
		async function onLinkClick(listItem) {
            listItem.addEventListener('dblclick', function(ev){
                ev.preventDefault();
				let str = listItem.getElementsByTagName("span")[0].innerText
                str = str.replace('(','')
                str = str.replace(')', '')
				downloadFile(str)
			}, false);
		}
		async function onLinkInit(){
			let itemList = document.getElementsByClassName("file-link");
			for (var i = 0; i < itemList.length; i++) {
				let fileObj = itemList[i].getElementsByTagName("span")[0]
				onLinkClick(fileObj);
			}
		}
		async function refreshContent(){
			REFRESH = true;
			setLoading().then(async function(res) {
				listFiles();
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
				listFiles();
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
		
		
		async function loadContent(){
			// Declare complete list
			let masterList = [];
			// Remove whatever content that is there now.
			let oldContent = document.getElementById('content');
			oldContent.innerHTML = '';

			// Get folders
			let folderList = await db.files.where({
				'parents': FOLDER_ID,
				'peopleid': PEOPLE_ID,
			}).and(function(item){
				return item.mimetype == 'application/vnd.google-apps.folder';
			}).sortBy('name');
			masterList.push(folderList);

			// Get files
			let fileList = await db.files.where({
				'parents': FOLDER_ID,
				'peopleid': PEOPLE_ID,
			}).and(function(item){
				return item.mimetype != 'application/vnd.google-apps.folder';
			}).sortBy('name');
			masterList.push(fileList);
			// Flatten array
			masterList = [].concat.apply([], masterList);

			// Remove loading icon
			let loadingIcon = document.getElementById('#loading');
			loadingIcon.style = "display: none;";
			let oContent = document.getElementById("#content");
			oContent.style = "";

			// Display file count in header
			const fileCount = document.getElementById("file-count");
			// Set file count in header
			fileCount.innerText = masterList.length;
			
			// Create elements for each file
			for (let i = 0; i < masterList.length; i++){
				// Declare variables
				let fileObj = masterList[i];
				let linkWithin = document.createElement("a");
				let contentWithin;
				// Set different settings for folders to display different
				if (fileObj.mimetype == 'application/vnd.google-apps.folder'){
					contentWithin = document.createTextNode(fileObj.name + '/');
					// Color for folders
					linkWithin.style = 'color: #3399ff;';
					// Link to browse to next folder
					linkWithin.href = `browser/${fileObj.id}`;
					linkWithin.rel = 'prefetch';
				} else {
					contentWithin = document.createTextNode(fileObj.name);
					linkWithin.setAttribute("class","file-link");
				};
				// Append contentWithin to linkWithin as a child
				linkWithin.appendChild(contentWithin);
				// Set html
				linkWithin.innerHTML = "<span class='file-obj'>" + linkWithin.innerHTML + ` <span id="file" class="text-xs text-gray-500">(${fileObj.id})</span></span>\n`;
				// Append to original list
				oldContent.appendChild(linkWithin);
			};
			// Initialize links
			onLinkInit();
		};
		async function getParent(){
			// To display the parent id next to "../"
			const returnDiv = document.getElementById("parent_id");
			// To display the directory title at top
			const dirTitle = document.getElementById("dir-title");
			let folderName = "my drive";
			// Link to parent directory
			const returnLink = document.getElementById("returnLink");
			let returnFolder;

			// CHECK IF IN/IS TEAM DRIVE OR NOT
			await gapi.client.drive.files.get({
						'fileId':FOLDER_ID,
						'supportsAllDrives':true,
						'includeItemsFromAllDrives':true,
						'fields': "name, id, parents, driveId"
			}).then(async function(resp){
				// Check if "driveId" is present and 
				// the folder id length is less than 30
				// (to make sure, it is infact, a team drive)
				if (resp.result.driveId && FOLDER_ID.length < 30){
					await gapi.client.drive.drives.get({'driveId':FOLDER_ID})
					.then(async function(resp){
						// IS A TEAM DRIVE 
						folderName = resp.result.name;
						returnFolder = 'shared-drives';
						returnDiv.href = returnFolder;
					});
				} else {
					// NOT A TEAM DRIVE
					folderName = resp.result.name;
					if (resp.result.driveId && FOLDER_ID.length > 30){
						returnFolder = resp.result.parents[0];
					} else {
						returnFolder = 'root'
					}
					

					returnDiv.href = `browser/${returnFolder}`;
				}
			});
			// Update the ID to the right side ../
			returnLink.innerText = `(${returnFolder})`;
			// Add directory name to top
			dirTitle.innerText = folderName;
		}
		async function listFiles(){

			async function checkForCache(){
				if (REFRESH) {
					await db.files.where({
						'parents': FOLDER_ID,
						'peopleid': PEOPLE_ID,
					}).delete()
				}
				let cacheExists = false;
				let ifCache = await db.files.where('parents').equals(FOLDER_ID).and(
				function(item) { return item.peopleid == PEOPLE_ID }).sortBy('name');
				if (ifCache.length > 0) {cacheExists = true;};
				return cacheExists;
			};
			async function getFiles(){
				let fetchFiles = true;
				let fileList = [];
				let parentFolder = 'root';
				let nextPageToken;
				// Get files from API and cache
				checkForCache().then(async function(res){
					if (res == false) {
						while (fetchFiles){
							await gapi.client.drive.files.list({
								'q':`'${FOLDER_ID}' in parents and trashed=false`,
								'pageSize': 1000,
								'supportsAllDrives': true,
								'includeItemsFromAllDrives': true,
								'fields': 'nextPageToken, files(name, id, parents, size, mimeType, modifiedTime, driveId)',
								'pageToken': nextPageToken,
							}).then(async function(resp) {
								fileList.push(resp.result.files);
								if (!resp.result.nextPageToken) {fetchFiles = false;}
								else { nextPageToken = resp.result.nextPageToken; };
							});
						};
						// Flatten array
						fileList = [].concat.apply([], fileList);

						for (let i = 0; i < fileList.length; i++){
							let fileObj = fileList[i];
							if (FOLDER_ID != 'root') {
								parentFolder = (fileObj.parents).toString();
							};
							await db.files.put({
								name: fileObj.name,
								id: fileObj.id,
								parents: parentFolder,
								size: fileObj.size,
								mimetype: fileObj.mimeType,
								driveid: fileObj.driveId,
								peopleid: PEOPLE_ID,
							});
						};
					};
				}).then(async function(){
					await getParent();
					await loadContent();
				})
				
			};
			await getFiles();
		};
		async function searchFiles(searchText){
			let fetchFiles = true;
			let nextPageToken;
			let fileList = [];
			while (fetchFiles){
				await gapi.client.drive.files.list({
					'q':`fullText contains '${searchText}' or name contains '${searchText}'`,
					'pageSize': 1000,
					'supportsAllDrives':true,
					'includeItemsFromAllDrives':true,
					'fields': "nextPageToken, files(name, id, parents, size, mimeType, modifiedTime)",
					'pageToken':nextPageToken
				}).then(function(response){
					fileList.push(response.result.files);
					if (!response.result.nextPageToken) {
						fetchFiles = false;
					} else {
						nextPageToken = response.result.nextPageToken;
					};
				});	
			}
			fileList = [].concat.apply([], fileList)
			console.log(fileList);
		}
		handleClientLoad();
	});
</script>

<span class="text-xl">Index of ./<span id="dir-title"></span>/</span> <span class="text-gray-500">({folder_id})</span>
<br><hr><span class="text-xs">total files & folders: <span id="file-count"></span></span><hr><br>
<button id="authorize_button" style="display: none;" class="bg-white hover:bg-gray-100 text-gray-800 font-semibold px-2 border border-gray-400 rounded shadow">
	Authorize</button>
<button id="signout_button" style="display: none;" class="bg-white hover:bg-gray-100 text-gray-800 font-semibold px-2 border border-gray-400 rounded shadow">
	Sign Out</button>
<button id="refresh_button" style="display: none;" class="bg-white hover:bg-gray-100 text-gray-800 font-semibold px-2 border border-gray-400 rounded shadow">
	Refresh</button>


<div>
	<div id="#loading">
		<br>
		<img width="30px" height="30px" alt="Loading.." src="{loading}">
	</div>
	<div id="#content" style="display: none;">
		<div>
			<a id="parent_id" style="color:#1da3a3;">../</a> <span id="returnLink" class="text-xs text-gray-500"></span>
		</div>
		<pre class="content-list" id="content">
			
		</pre>
	</div>
</div>