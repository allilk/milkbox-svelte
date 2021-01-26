<script context="module">
	export async function preload(page, folder_id) {
		const { slug } = page.params;
		folder_id = slug;
		return { folder_id };
	}

</script>
<script type='text/javascript'>
	export let folder_id;
    import db from './connection';
    import { afterUpdate, beforeUpdate, onMount } from 'svelte';
    import natsort from '../../scripts/natsort.min.js';
	import {api_key, client_id, discovery_docs, scopes} from '../stores';
	
	let keyCode;
	let folderParent;
	let itemList;
	let lineSelected = 0;
	let sorted = 0;
	let sortedname = 0;
	let finalList = [];
	const searchGrid = () => {
        let input, filter, contentList, flex, listitem, i, txtValue;
        input = document.getElementById("search_input");
        filter = input.value.toUpperCase();
        contentList = document.getElementById("content-list");
        flex = contentList.getElementsByClassName("not-selected");
			for (i = 0; i < flex.length; i++) {
				listitem =flex[i].getElementsByTagName("a")[0];
					if (listitem) {
						txtValue = listitem.textContent || listitem.innerText;
					if (txtValue.toUpperCase().indexOf(filter) > -1) {
						flex[i].style.display = "";
					} else {
						flex[i].style.display = "none";
					}
				}       
			}
        }
	const getAllWords = (text) => {
			var allWordsIncludingDups = text.split(' ');
			var wordSet = allWordsIncludingDups.reduce(function (prev, current) {
				prev[current] = true;
				return prev;
			}, {});
			return Object.keys(wordSet);
			};
    const formatBytes = (bytes, decimals=2) => {
            if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const dm = decimals < 0 ? 0 : decimals;
                const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

                const i = Math.floor(Math.log(bytes) / Math.log(k));

                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };
	const setLoading = async () => {
		try {
			let loadingIcon = document.getElementById('#loading');
			loadingIcon.style = "";
			let Content = document.getElementById("content-list");
			Content.style = "display: none;";
		} catch {

		}

		}
	const handleKeydown = async (event) => {
		keyCode = event.keyCode;
		if (keyCode == 83 || keyCode == 40) {
			if (lineSelected < itemList.length - 1){
				if (typeof itemList[lineSelected] != undefined){
					itemList[lineSelected].classList.remove('selected');
				}
				lineSelected+=1;
				let objSelected=itemList[lineSelected];
				objSelected.classList.add('selected');
				let obj = document.getElementsByClassName("selected")[0];
				obj.scrollIntoView({behavior: "smooth", block: "center"});
			}
		} else if(keyCode == 87 || keyCode == 38){
			if (lineSelected > 0){
				if (typeof itemList[lineSelected] != undefined){
					itemList[lineSelected].classList.remove('selected');
				}
				lineSelected-=1;
				let objSelected=itemList[lineSelected];
				objSelected.classList.add('selected');
				let obj = document.getElementsByClassName("selected")[0];
				obj.scrollIntoView({behavior: "smooth", block: "center"});
			}
		} else if(keyCode == 13){
			event.preventDefault();
			let selObj = document.getElementsByClassName('selected')[0];
			let linkObj = selObj.getElementsByTagName('a')[0]
			linkObj.click()
		}
	
		};
	beforeUpdate(async () => {
		setLoading();
	});
	afterUpdate(async() => {
		lineSelected = 0;
		let FOLDER_ID = folder_id[0];
		let PEOPLE_ID;
		let QUERY;
		let REFRESH = false;
		let IS_SEARCH = 'false';
		let SHARED = 'false';
		let DISPLAY_FID = false;
		
		const authorizeButton = document.getElementById('authorize_button');
		const signoutButton = document.getElementById('signout_button');
		const refreshButton = document.getElementById('refresh_button');
		const nameHeader = document.getElementById('sort-name');
		const sizeHeader = document.getElementById('sort-size');

		db.settings.where('user').equals(0).toArray().then(function(resp){
			console.log(resp)
			if (!resp[0].displayfid || resp[0].displayfid == 'yes') {
				DISPLAY_FID = true;
			}
		});
		handleClientLoad()
		const createContent = async (fileName, fileId, fileMimeType, fileSize) => {
			let mainDiv = document.createElement('div');
			let existingContent = document.getElementById('content-list');
			let divElement = document.createElement('div');

			
			let sizeElement = document.createElement('div');
			sizeElement.innerText = formatBytes(fileSize,0);
			sizeElement.setAttribute("class", "col-span-1 file-size text-right");

			let linkWithin = document.createElement('a');
			linkWithin.innerText = fileName;
			// linkWithin.setAttribute('class','truncate')
			let divClasses = `grid grid-cols-6 align-middle space-x-2 shadow-sm not-selected ${fileMimeType} py-3 px-4`;
			mainDiv.title = fileName;
			let emojiMime = '❔';
			if (fileMimeType == 'folder') {
				linkWithin.innerText += `/`
				emojiMime = '📂';
				linkWithin.href = `drive/${fileId}`;
			} else { 
				divClasses += " file"
				
				if (fileMimeType.includes('video')) {
					emojiMime = '📺';
				} else if (fileMimeType.includes('audio')) {
					emojiMime = '🎵';
				} else if (fileMimeType.includes('image/')) {
					emojiMime = '🖼️';
				} else if (fileMimeType.includes('/x-iso') || fileMimeType.includes('cd-image')) {
					emojiMime = '💿';
				} else if (fileMimeType.includes('/zip') || fileMimeType.includes('rar') || fileMimeType.includes('compressed')) {
					emojiMime = '🗄️';
				} else if (fileMimeType.includes('text')) {
					emojiMime = '📃';
				} else {
					emojiMime = '❔';
				}
			};
			linkWithin.innerText = `${emojiMime} ${linkWithin.innerText}`

			if (DISPLAY_FID == true) {
				let idWithin = document.createElement('span');
				idWithin.setAttribute("class", "text-xs file-id");
				idWithin.innerText = ` (${fileId})`
				linkWithin.appendChild(idWithin)
			}
			

			divElement.setAttribute("class", "col-span-5 file-title truncate");
			divElement.appendChild(linkWithin);

			mainDiv.appendChild(divElement)
			mainDiv.appendChild(sizeElement)
			mainDiv.setAttribute("class", divClasses);

			existingContent.appendChild(mainDiv)

			};
		const getParent = async() => {
			// To display the directory title at top
			const dirTitle = document.getElementById("dir-title");
			let folderName = "my drive";
			let parentId= 'root';
			if (FOLDER_ID == 'shared-with-me'){
				folderName = "Shared With Me";
			} else {
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
							try {
								parentId = resp.result.parents[0];
							} catch { parentId = 'shared-with-me'}
						}
					}
				})
				};
				// Add directory name to top
				dirTitle.innerText = folderName;
				return parentId;
				
			}			
		const loadContent = async () => {
			// Declare natsort sorter
			let sorter = natsort({ insensitive: true });

			let masterList = [];
			// // Remove whatever content that is there now.
			let oldContent = document.getElementById('content-list');
			oldContent.innerHTML = '';
			
			if (IS_SEARCH == "false" && FOLDER_ID != 'shared-with-me'){
				// Get folders
				let folderList = await db.files.where({
					'parents': FOLDER_ID,
					'peopleid': PEOPLE_ID,
					'issearch': IS_SEARCH,
					'shared': SHARED
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
					'shared':SHARED
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
			} else if (FOLDER_ID == 'shared-with-me'){
				masterList = await db.files.where({
					'parents': 'root',
					'peopleid': PEOPLE_ID,
					'issearch': IS_SEARCH,
					'shared': SHARED
				}).toArray()
			} else {
				masterList = await db.files.where('words').startsWithIgnoreCase(QUERY).distinct().toArray()
				let indexHeader = document.getElementById('index-header');
				indexHeader.innerText = 'Search Results'
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
				folderParent = resp;
				createContent('..', resp, 'folder', 0).then(function () {
					for (let i = 0; i < masterList.length; i++){
						let fileObj = masterList[i];
						let fileSize = 0;
						// Add to total directory size
						if (parseInt(fileObj.size) > 0){
							totalSize += parseInt(fileObj.size);
							fileSize = parseInt(fileObj.size);
						};
						finalList.push(fileObj)
						createContent(fileObj.name, fileObj.id, fileObj.mimetype, fileSize)
					};
				}).then(function (){
					// Reflect directory size in header
					const sizeTotal = document.getElementById("total-size");
					sizeTotal.innerText = formatBytes(totalSize);
					// // Initialize links
					// onLinkInit();
					itemList = document.getElementsByClassName("not-selected");
					// IS_SEARCH = "false";
				})
			});
			
			};
		const checkForCache = async () => {
			let cacheId = FOLDER_ID;
			if (SHARED == 'true'){
				cacheId = 'root';
			}
			if (REFRESH) {
				await db.files.where({
					'parents': cacheId,
					'peopleid': PEOPLE_ID,
					'issearch': IS_SEARCH,
					'shared': SHARED
				}).delete()
			}
			let cacheExists = false;
			let ifCache = await db.files.where({
				'parents': cacheId,
				'peopleid': PEOPLE_ID,
				'issearch': IS_SEARCH,
				'shared': SHARED
			}).sortBy('name');
			if (ifCache.length > 0) {cacheExists = true;};
			return cacheExists;
			};
		const getFiles = async () => {
			let fetchFiles = true;
			let fileList = [];
			let parentFolder = 'root';
			let nextPageToken;
			let querySearch;
			// Get files from API and cache
			checkForCache().then(async function(res){
				if (typeof QUERY != "undefined"){
					querySearch = `name contains '${QUERY}'`;
				} else if (FOLDER_ID == 'shared-with-me'){
					querySearch = 'sharedWithMe'
				} else if (FOLDER_ID != 'shared-with-me') {
					querySearch = `'${FOLDER_ID}' in parents and trashed=false`;
				};
				if (res == false || typeof QUERY != "undefined") {
					while (fetchFiles){
						console.log('getting files from gapi')
						await gapi.client.drive.files.list({
							'q':querySearch,
							'pageSize': 1000,
							'supportsAllDrives': true,
							'includeItemsFromAllDrives': true,
							'corpora':'allDrives',
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
						if (FOLDER_ID != 'root' && FOLDER_ID != 'shared-with-me' || typeof QUERY != "undefined" ) {
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
								shared: SHARED,
								words: getAllWords(fileObj.name)
							});
					};
				};
			}).then(async function(){
				// Remove whatever content that is there now.
				let oldContent = document.getElementById('content-list');
				oldContent.innerHTML = '';
				finalList = [];
			}).then(function(){
				loadContent()		
			});
			
			};

		const sortSize = async () => {
			// // Remove whatever content that is there now.
			let oldContent = document.getElementById('content-list');
			oldContent.innerHTML = '';
			let newList = [];
			setLoading();
			// console.log(finalList)
			for (let i = 0; i < finalList.length; i++){
				let obj = finalList[i]
				let newSize = obj.size;
				if (obj.size == undefined) {
					newSize = '0';
				}
				let newobj = {
					name: obj.name,
					id: obj.id,
					mimetype: obj.mimetype,
					size:parseInt(newSize),
				}
				// console.log(newobj)
				newList.push(newobj)
			}
			if (sorted == 1){
				sorted = 0;
				newList = newList.sort(function (a, b) {
				return a.size - b.size;
				});
			} else {
				sorted = 1;
				newList = newList.sort(function (a, b) {
				return b.size - a.size;
				});
			}
			
			// console.log(newList)
			createContent('..', folderParent, 'folder', 0).then(function () {
				// Remove loading icon
				let loadingIcon = document.getElementById('#loading');
				loadingIcon.style = "display: none;";
				oldContent.style = "";
				for (let i = 0; i < newList.length; i++){
					let fileObj = newList[i];
					let fileSize = 0;
					// Add to total directory size
					if (parseInt(fileObj.size) > 0){
						fileSize = parseInt(fileObj.size);
					};
					createContent(fileObj.name, fileObj.id, fileObj.mimetype, fileSize)
				};
			})
			}	
		const sortName = async () => {
			let sorter = natsort({ insensitive: true });
			// // Remove whatever content that is there now.
			let oldContent = document.getElementById('content-list');
			oldContent.innerHTML = '';
			let newList = finalList;
			
			setLoading();
			if (sortedname == 1){
				sortedname = 0;
				newList = newList.sort(function(a, b) {
					return sorter(a.name, b.name);
				});
			} else {
				sortedname = 1;
				sorter = natsort({ insensitive: true, desc: true });
				newList = newList.sort(function(a, b) {
					return sorter(a.name, b.name);
				});
			}
			
			// console.log(newList)
			createContent('..', folderParent, 'folder', 0).then(function () {
				// Remove loading icon
				let loadingIcon = document.getElementById('#loading');
				loadingIcon.style = "display: none;";
				oldContent.style = "";
				for (let i = 0; i < newList.length; i++){
					let fileObj = newList[i];
					let fileSize = 0;
					// Add to total directory size
					if (parseInt(fileObj.size) > 0){
						fileSize = parseInt(fileObj.size);
					};
					createContent(fileObj.name, fileObj.id, fileObj.mimetype, fileSize)
				};
			})
			}	
		const refreshContent = async () => {
			setLoading().then(function(){
				REFRESH = true;
				getFiles().then(function(){
					REFRESH = false;
				});
			})
			}
		function handleClientLoad() {
			gapi.load('client:auth2', onLoadCallback);
		    }
		function onLoadCallback() {
			gapi.client.init({
			cookiepolicy: 'single_host_origin',
			apiKey: $api_key,
			clientId: $client_id,
			discoveryDocs: $discovery_docs,
			scope: $scopes
			}).then(function () {

			gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

			updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
			authorizeButton.onclick = handleAuthClick;
			signoutButton.onclick = handleSignoutClick;
			refreshButton.onclick = refreshContent;
			nameHeader.onclick = sortName;
			sizeHeader.onclick = sortSize;
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
				if (FOLDER_ID == 'shared-with-me'){
					SHARED = 'true';
				}
				getFiles();
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
	});
</script>
<svelte:window on:keydown={handleKeydown}/>
<div class="top-header shadow-lg px-4 md:px-8 py-12 md:py-16 ">
	<span id="index-header" class="font-bold text-xl md:text-2xl"><span>index of ./<span id="dir-title"></span>/ </span></span><span class="text-lg md:text-xl file-id">({folder_id})</span>
	<br><hr><span class="text-sm font-bold">total files & folders: <span class="font-normal" id="file-count"></span>  total size (excl. folders): <span class="font-normal" id="total-size"></span></span><hr>
	<span class="text-sm">quick links: </span>
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
<div class="px-4 md:px-8 shadow-inner">
	<br>
	<div class="flex items-center">
		<div class="flex-auto inline-flex">
			<button id="authorize_button" style="display: none;" class="font-semibold px-2 py-2 rounded-none shadow">
				Authorize</button>
			<button id="signout_button" style="display: none;" class="font-semibold px-2 py-2 rounded-none shadow">
				Sign Out</button>
			<button id="refresh_button" style="display: none;" class="font-semibold px-2 py-2 rounded-none shadow">
				Refresh</button>
		</div>
		<div class="flex-auto pl-2">
			<div class="bg-white border relative px-4">
				<input on:keyup={searchGrid} type="search" name="search" id="search_input" placeholder="Search"
						class="appearance-none inline-flex w-full outline-none focus:outline-none active:outline-none"/>
				<button type="submit" class="-ml-3 inline-flex absolute outline-none focus:outline-none active:outline-none bg-transparent hover:bg-transparent">
					<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						viewBox="0 0 24 24" class="w-6 h-6">
					<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
					</svg>
				</button>
			</div>
		</div>
	</div>
	<div class="grid grid-cols-6 text-sm sticky items-center">
		
		<div id="sort-name" class="col-span-5 font-bold py-3 animation-pulse">Name</div>
		<div id="sort-size" class="col-span-1 font-bold file-size mr-8 text-right">Size</div>
	
	
		<div id="#loading" class="col-span-full">
			<center>
				<div class="lds-ripple"><div></div><div></div></div>
			</center>
		</div>
	</div>
	<form>
		<div id="content-list" class="text-sm">
	
		</div>
	</form>
</div>