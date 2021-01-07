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
			let Content = document.getElementById("content-list");
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
		let QUERY;
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
            // listItem.addEventListener('dblclick', function(ev){
            //     ev.preventDefault();
			// 	let str = listItem.getElementsByTagName("span")[0].innerText
            //     str = str.replace('(','')
            //     str = str.replace(')', '')
			// 	downloadFile(str)
			// }, false);
		}
		async function onLinkInit(){
			let itemList = document.getElementsByClassName("file");
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
		const updateParent = async () => {
			// formatBytes(parseInt(fileObj.size))
			
		}
		const createContent = async (fileName, fileId, fileMimeType, fileSize) => {
			let mainDiv = document.createElement('div');
			let existingContent = document.getElementById('content-list');
			let divElement = document.createElement('div');

			
			let sizeElement = document.createElement('div');
			sizeElement.innerText = formatBytes(fileSize);
			sizeElement.setAttribute("class", "col-span-2 file-size");

			let linkWithin = document.createElement('a');
			linkWithin.innerText = fileName;

			let idWithin = document.createElement('span');
			idWithin.setAttribute("class", "text-sm text-gray-500");
			idWithin.innerText = ` (${fileId})`

			
			let divClasses = `grid grid-cols-6 not-selected ${fileMimeType}`;

			if (fileMimeType == 'folder') {
				linkWithin.innerText += `/`
				linkWithin.href = `browser/${fileId}`;
			} else { 
				divClasses += " file"
			};
			
			linkWithin.appendChild(idWithin)
			divElement.setAttribute("class", "col-span-4");
			divElement.appendChild(linkWithin);
			mainDiv.appendChild(divElement)
			mainDiv.appendChild(sizeElement)
			mainDiv.setAttribute("class", divClasses);
			existingContent.appendChild(mainDiv)

		};
		async function loadContent(){
			// Declare natsort sorter
			let sorter = natsort({ insensitive: true });
			// Declare complete list
			let masterList = [];
			// Remove whatever content that is there now.
			let oldContent = document.getElementById('content-list');
			oldContent.innerHTML = '';
			

			if (IS_SEARCH == "false"){
				// Get folders
				let folderList = await db.files.where({
					'parents': FOLDER_ID,
					'peopleid': PEOPLE_ID,
					'issearch': IS_SEARCH,
				}).and(function(item){
					return item.mimetype == 'folder';
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
					return item.mimetype != 'folder';
				}).sortBy('name');

				// Sort using natsort!
				fileList.sort(function(a, b) {
					return sorter(a.name, b.name);
				});

				masterList.push(fileList);
				// Flatten array
				masterList = [].concat.apply([], masterList);

			} else {
				masterList = await db.files.where('words').startsWithIgnoreCase(QUERY).distinct().toArray()
				let indexHeader = document.getElementById('index-header');
				indexHeader.innerText = 'Search Results'
				console.log(masterList)
			}


			// Remove loading icon
			let loadingIcon = document.getElementById('#loading');
			loadingIcon.style = "display: none;";
			let oContent = document.getElementById("content-list");
			oContent.style = "";

			// Display file count in header
			const fileCount = document.getElementById("file-count");
			// Set file count in header
			fileCount.innerText = masterList.length;
			
			// Declare cumulative size variable
			let totalSize = 0;

			// Create elements for each file
			getParent().then(function (resp) {
				createContent('..', resp, 'folder', 0).then(function () {
					for (let i = 0; i < masterList.length; i++){
						let fileObj = masterList[i];
						let fileSize = 0;
						// Add to total directory size
						if (parseInt(fileObj.size) > 0){
							totalSize += parseInt(fileObj.size);
							fileSize = parseInt(fileObj.size);
						};
						createContent(fileObj.name, fileObj.id, fileObj.mimetype, fileSize)
					};
				}).then(function (){
					// Reflect directory size in header
					const sizeTotal = document.getElementById("total-size");
					sizeTotal.innerText = formatBytes(totalSize);
					// Initialize links
					onLinkInit();
					IS_SEARCH = "false";
				})
			});
			

			
		};
		async function getParent(){
			// To display the directory title at top
			const dirTitle = document.getElementById("dir-title");
			let folderName = "my drive";
			let parentId;

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
						parentId = 'shared-drives';
					});
				} else {
					// NOT A TEAM DRIVE
					folderName = resp.result.name;
					if (FOLDER_ID.length > 30 || resp.result.driveId){
						parentId = resp.result.parents[0];
					} else  if(!resp.result.driveId) {
						parentId = 'root'
					}
				}
			})
			// Add directory name to top
			dirTitle.innerText = folderName;
			return parentId;
			
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
		const initKeyNav = async () => {
			let itemList = document.getElementsByClassName("not-selected");
			let lineSelected = 0;
			let objSelected
			let obj;
			let str;
			let fileId;
			document.querySelector('body').addEventListener('keydown', function(ev){
				if (ev.keyCode === 83) {
                if (lineSelected < itemList.length - 1){
                    if (typeof itemList[lineSelected] != undefined){
                        itemList[lineSelected].classList.remove('selected');
                    }
						lineSelected+=1;
						objSelected=itemList[lineSelected];
						objSelected.classList.add('selected');
						obj = document.getElementsByClassName("selected")[0];
						obj.scrollIntoView({behavior: "smooth", block: "center"});
					}
				} else if (ev.keyCode === 87) {
					if (lineSelected > 0){
						if (typeof itemList[lineSelected] != undefined){
							itemList[lineSelected].classList.remove('selected');
						}
						lineSelected-=1;
						objSelected=itemList[lineSelected];
						objSelected.classList.add('selected');
						obj = document.getElementsByClassName("selected")[0];
						obj.scrollIntoView({behavior: "smooth", block: "center"});
					}
				} else if (ev.keyCode === 13) {
					if (typeof itemList[lineSelected] != undefined){
						fileId = itemList[lineSelected].getElementsByClassName("text-gray-500")[0];
						str = fileId.textContent
						str = str.replace(' (','')
						str = str.replace(')', '')
						if ( str == 'shared-drives' || str == 'root') {
							window.location.replace('browser/'+str)
						} else {
							FOLDER_ID = str;
							getFiles()

						}
					}
				}
			});
			
		}
		async function getFiles(){
			let fetchFiles = true;
			let fileList = [];
			let parentFolder = 'root';
			let nextPageToken;

			// Get files from API and cache
			checkForCache().then(async function(res){
				let querySearch;
				
				// fullText contains '{query}' or name contains '{query}'
				if (res == false || typeof QUERY != "undefined") {
					
					if (typeof QUERY != "undefined"){
						querySearch = `name contains '${QUERY}'`;
						
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
							// for (let i = 0; i < resp.result.files.length; i++){
							// 	let fileObj = resp.result.files[i];
							// 	createContent(fileObj.name, fileObj.id, fileObj.mimeType)
							// }
							fileList.push(resp.result.files);
							if (!resp.result.nextPageToken) {fetchFiles = false;}
							else { nextPageToken = resp.result.nextPageToken; };
						});
					};
					// Flatten array
					fileList = [].concat.apply([], fileList);
					
					for (let i = 0; i < fileList.length; i++){
						let fileObj = fileList[i];
						if (FOLDER_ID != 'root' || typeof QUERY != "undefined") {
							parentFolder = (fileObj.parents).toString();
						};
						if (typeof QUERY != "undefined"){
							IS_SEARCH = 'true';
						} 
						let shortenedMime = (fileObj.mimeType).split('.')
						if (shortenedMime.length < 3) {
							shortenedMime =  shortenedMime[0]
						} else { shortenedMime = shortenedMime[2]};
						await db.files.put({
							name: fileObj.name,
							id: fileObj.id,
							parents: parentFolder,
							size: fileObj.size,
							mimetype: shortenedMime,
							driveid: fileObj.driveId,
							peopleid: PEOPLE_ID,
							issearch: IS_SEARCH,
							words: getAllWords(fileObj.name)
						}).then(async function(res){
							// console.log(res)
						});
						
					};
				};
			}).then(async function(){
				// if (IS_SEARCH == 'false'){
				// 	await getParent();
				// };
			}).then(async function(){
				await loadContent().then(function(){
					initKeyNav();
				});
				
			});
			
		};

	

		function getAllWords(text) {
			var allWordsIncludingDups = text.split(' ');
			var wordSet = allWordsIncludingDups.reduce(function (prev, current) {
				prev[current] = true;
				return prev;
			}, {});
			return Object.keys(wordSet);
		}
		handleClientLoad();
	// 	const searchContent = document.getElementById("search_input")
	// 		document.getElementById("search_input").addEventListener('keypress', function (e) {
	// 			if (e.key === 'Enter') {
	// 				setLoading().then(function(res){
	// 					QUERY = searchContent.value;
	// 					getFiles();
	// 				});
	// 			};
	// 		});
	});
</script>

<span id="index-header" class="text-2xl"><span>Index of ./<span id="dir-title"></span>/</span> <span class="text-gray-500">({folder_id})</span></span>
<br><hr><span class="text-sm font-bold">total files & folders: <span class="font-normal" id="file-count"></span>  total size (excl. folders): <span class="font-normal" id="total-size"></span></span><hr><br>
<button id="authorize_button" style="display: none;" class="bg-white hover:bg-gray-100 text-gray-800 font-semibold px-2 border border-gray-400 rounded shadow">
	Authorize</button>
<button id="signout_button" style="display: none;" class="bg-white hover:bg-gray-100 text-gray-800 font-semibold px-2 border border-gray-400 rounded shadow">
	Sign Out</button>
<button id="refresh_button" style="display: none;" class="bg-white hover:bg-gray-100 text-gray-800 font-semibold px-2 border border-gray-400 rounded shadow">
	Refresh</button>


<div class="grid grid-cols-6 gap-1 text-xl">

	<div class="col-span-4 font-bold">Name</div>
	<div class="font-bold">Size</div>


	<div id="#loading" class="col-span-full">
		<center>
			<img width="30px" height="30px" alt="Loading.." src="{loading}">
		</center>
	</div>
</div>
<div id="content-list" class="gap-1 text-xl">

</div>