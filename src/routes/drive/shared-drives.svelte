<script>
    import { afterUpdate, beforeUpdate, onMount } from 'svelte';
    import db from './connection';
    import {setLoading} from '../functions';
    import initClient from '../init_gapi';

    let keyCode, itemList;
    let lineSelected = 0;
    let client;
    const searchGrid = () => {
        let input, filter, contentList, flex, listitem, i, txtValue;
        input = document.getElementById("search_input");
        filter = input.value.toUpperCase();
        contentList = document.getElementById("content-list");
        flex = contentList.getElementsByClassName("drive-obj");
			for (i = 0; i < flex.length; i++) {
				listitem =flex[i].getElementsByTagName("div")[0];
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
    const handleKeydown = async (event) => {
		keyCode = event.keyCode;
		if (keyCode == 83 || keyCode == 40) {
			if (lineSelected < itemList.length - 1){
				if (typeof itemList[lineSelected] != undefined){
					itemList[lineSelected].classList.remove('drive-select');
				}
				lineSelected+=1;
				let objSelected=itemList[lineSelected];
				objSelected.classList.add('drive-select');
				let obj = document.getElementsByClassName("drive-select")[0];
				obj.scrollIntoView({behavior: "smooth", block: "center"});
			}
		} else if(keyCode == 87 || keyCode == 38){
			if (lineSelected > 0){
				if (typeof itemList[lineSelected] != undefined){
					itemList[lineSelected].classList.remove('drive-select');
				}
				lineSelected-=1;
				let objSelected=itemList[lineSelected];
				objSelected.classList.add('drive-select');
				let obj = document.getElementsByClassName("drive-select")[0];
				obj.scrollIntoView({behavior: "smooth", block: "center"});
			}
		} else if(keyCode == 13){
			event.preventDefault();
			let selObj = document.getElementsByClassName('drive-select')[0];
			selObj.click()
		}
	
		};
	beforeUpdate(async () => {
        setLoading();
    });
    afterUpdate(async () => {
        let REFRESH = false;
        
        // let getClient = function() {
        //     return new Promise(function(resolve, reject) {
        //         let client = new initClient;
        //         resolve(client);
        //     });
        // };
        // var getNewGift = function() {
        // Promise.all([
        //     getClient()
        // ]).then(function(result) {
        //     console.log(result[0].PEOPLE_ID);
        // });
        // };
        // getNewGift();
        async function refreshContent(){
			REFRESH = true;
			setLoading().then(async function(res) {
				listDrives();
			});
		}
        async function listDrives() {
            async function checkForCache(){
                if (REFRESH) {
					await db.drives.where({
						'peopleid': client.PEOPLE_ID,
					}).delete()
				}
                let cacheExists = false;
                let ifCache = await db.drives.where('peopleid').equals(client.PEOPLE_ID).toArray();
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
                            name: drive.name, id: drive.id, peopleid: client.PEOPLE_ID,
                        });
                    }
                }
            }).then(async function (){
                await loadContent();
            });

            
        }
        async function loadContent() {
            let driveList = await db.drives.where('peopleid').equals(client.PEOPLE_ID).toArray();

            let oldContent = document.getElementById('content-list');
            oldContent.innerHTML = '';

            let loadingIcon = document.getElementById('#loading');
            loadingIcon.style = 'display: none;';

            for (let i = 0; i < driveList.length; i++){
                let divElement = document.createElement('div');
                let drive = driveList[i];
                let newObj = document.createElement("a");
                let newContent = document.createTextNode(drive.name);
                let bottomContent = document.createElement('div');
                bottomContent.innerText = `(${drive.id})`;
                bottomContent.setAttribute('class','text-xs text-gray-500')
                bottomContent.id = 'file';
                newObj.href = `drive/${drive.id}`;
                newObj.setAttribute("class", "drive-obj whitespace-normal text-center text-lg px-16 py-6 shadow-inner col-span-2 md:col-span-1");
                
                divElement.appendChild(newContent);
                divElement.appendChild(bottomContent)
                newObj.appendChild(divElement);
                oldContent.appendChild(newObj);
                
            };
            let totalDrives = document.getElementById('total-drives');
            totalDrives.innerText = `(${driveList.length})`;
            itemList = document.getElementsByClassName("drive-obj");
        }
    });
		
</script>
<svelte:window on:keydown={handleKeydown}/>
<div class="top-header shadow-lg px-8 py-16 sm:py-12 ">
    <span id="index-header" class="text-2xl">my shared drives <span id="total-drives" class=" text-gray-500"></span></span>
    <br><hr>
	<div class="mt-2">
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
	</div>
    <br>
</div>
<div class="px-4 md:px-8 shadow-inner whitespace-nowrap overflow-x-hidden">
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
    <div class="grid grid-cols-1 md:grid-cols-2 text-sm sticky px-4 md:px-8">
        <div id="#loading" class="col-span-full">
            <center>
                <div class="lds-ripple"><div></div><div></div></div>
            </center>
        </div>
    </div>
    <br>
    <div id="content-list" class="grid grid-cols-1 md:grid-cols-2">
    
    </div>
</div>