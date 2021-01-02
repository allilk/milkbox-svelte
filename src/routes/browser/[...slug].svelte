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
	import natsort from '../../scripts/natsort.min.js';


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
		let IS_SEARCH = 'false';
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
		function formatBytes(bytes, decimals = 2) {
			if (bytes === 0) return '0 Bytes';

			const k = 1024;
			const dm = decimals < 0 ? 0 : decimals;
			const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

			const i = Math.floor(Math.log(bytes) / Math.log(k));

			return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
		}
		async function loadContent(){
			// Declare natsort sorter
			let sorter = natsort({ insensitive: true });
			// Declare complete list
			let masterList = [];
			// Remove whatever content that is there now.
			let oldContent = document.getElementById('content');
			oldContent.innerHTML = '';
			

			if (IS_SEARCH == "false"){
				// Get folders
				let folderList = await db.files.where({
					'parents': FOLDER_ID,
					'peopleid': PEOPLE_ID,
					'issearch': IS_SEARCH,
				}).and(function(item){
					return item.mimetype == 'application/vnd.google-apps.folder';
				}).sortBy('name');
				// Sort using natsort!
				folderList.sort(function(a, b) {
					return sorter(a.name, b.name);
				});

				masterList.push(folderList);

				// Get files
				let fileList = await db.files.where({
					'parents': FOLDER_ID,
					'peopleid': PEOPLE_ID,
					'issearch': IS_SEARCH,
				}).and(function(item){
					return item.mimetype != 'application/vnd.google-apps.folder';
				}).sortBy('name');

				// Sort using natsort!
				fileList.sort(function(a, b) {
					return sorter(a.name, b.name);
				});

				masterList.push(fileList);
				// Flatten array
				masterList = [].concat.apply([], masterList);

			} else {
				masterList = await db.files.where({
					'parents': FOLDER_ID,
					'peopleid': PEOPLE_ID,
					'issearch': IS_SEARCH,
				}).sortBy('name');
			}


			// Remove loading icon
			let loadingIcon = document.getElementById('#loading');
			loadingIcon.style = "display: none;";
			let oContent = document.getElementById("#content");
			oContent.style = "";

			// Display file count in header
			const fileCount = document.getElementById("file-count");
			// Set file count in header
			fileCount.innerText = masterList.length;
			
			// Declare cumulative size variable
			let totalSize = 0;

			// Create elements for each file
			for (let i = 0; i < masterList.length; i++){
				// Declare variables
				let fileObj = masterList[i];
				let linkWithin = document.createElement("a");
				let contentWithin;

				// Add to total directory size
				if (parseInt(fileObj.size) > 0){
					totalSize += parseInt(fileObj.size);
				};

				// Set different settings for folders to display different
				if (fileObj.mimetype == 'application/vnd.google-apps.folder'){
					contentWithin = document.createTextNode(fileObj.name + '/');
					// Color for folders
					linkWithin.style = 'color: #3399ff;';
					// Link to browse to next folder
					linkWithin.href = `browser/${fileObj.id}`;
				} else {
					contentWithin = document.createTextNode(fileObj.name);
					linkWithin.setAttribute("class","file-link");
				};
				// Append contentWithin to linkWithin as a child
				linkWithin.appendChild(contentWithin);
				// Set html
				linkWithin.innerHTML = "<span class='file-obj'>" + linkWithin.innerHTML + ` <span id="file" class="text-sm text-gray-500">(${fileObj.id})</span></span>\n`;
				// Append to original list
				oldContent.appendChild(linkWithin);
			};
			// Reflect directory size in header
			const sizeTotal = document.getElementById("total-size");
			sizeTotal.innerText = formatBytes(totalSize);
			// Initialize links
			onLinkInit();

			IS_SEARCH = "false";
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
		};
		async function listFiles(){
			await getFiles();
		};
		async function checkForCache(){
			if (REFRESH) {
				await db.files.where({
					'parents': FOLDER_ID,
					'peopleid': PEOPLE_ID,
					'issearch': IS_SEARCH,
				}).delete()
			}
			let cacheExists = false;
			let ifCache = await db.files.where({
				'parents': FOLDER_ID,
				'peopleid': PEOPLE_ID,
				'issearch': IS_SEARCH,
			}).sortBy('name');
			if (ifCache.length > 0) {cacheExists = true;};
			return cacheExists;
		};
		async function getFiles(query){
			let fetchFiles = true;
			let fileList = [];
			let parentFolder = 'root';
			let nextPageToken;

			// Get files from API and cache
			checkForCache().then(async function(res){
				let querySearch;
				
				// fullText contains '{query}' or name contains '{query}'
				if (res == false || typeof query != "undefined") {
					
					if (typeof query != "undefined"){
						querySearch = `fullText contains '${query}' or name contains '${query}'`;
						
					} else {
						querySearch = `'${FOLDER_ID}' in parents and trashed=false`;
					};
					while (fetchFiles){
						await gapi.client.drive.files.list({
							'q':querySearch,
							'pageSize': 1000,
							'supportsAllDrives': true,
							'includeItemsFromAllDrives': true,
							'corpora':'allDrives',
							'fields': 'nextPageToken, files(name, id, parents, size, mimeType, modifiedTime, driveId)',
							'pageToken': nextPageToken,
						}).then(async function(resp) {
							console.log(resp.result)
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
						if (typeof query != "undefined"){
							IS_SEARCH = 'true';
						} 
						
						await db.files.put({
							name: fileObj.name,
							id: fileObj.id,
							parents: parentFolder,
							size: fileObj.size,
							mimetype: fileObj.mimeType,
							driveid: fileObj.driveId,
							peopleid: PEOPLE_ID,
							issearch: IS_SEARCH,
						});
						
					};
				};
			}).then(async function(){
				if (IS_SEARCH == 'false'){
					await getParent();
				};
			}).then(async function(){
				await loadContent();
			});
			
		};
		
		handleClientLoad();

		const searchContent = document.getElementById("search_input")
			document.getElementById("search_input").addEventListener('keypress', function (e) {
				if (e.key === 'Enter') {
					setLoading().then(function(res){
						getFiles(searchContent.value);
					});
				};
			});
	});
</script>
<input id="search_input" style="background-color: #080828; font-size: 1.25rem;" class="text-white w-full p-2" placeholder="Search...">
<span class="text-2xl">Index of ./<span id="dir-title"></span>/</span> <span class="text-gray-500">({folder_id})</span>
<br><hr><span class="text-sm font-bold">total files & folders: <span class="font-normal" id="file-count"></span>  total size (excl. folders): <span class="font-normal" id="total-size"></span></span><hr><br>
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
			<a id="parent_id" class="text-base" style="color:#3399ff;">../<span id="returnLink" class="text-sm text-gray-500"></span></a> 
		</div>
		<pre class="content-list" id="content">
			
		</pre>
	</div>
</div>