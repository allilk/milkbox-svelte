<script>
    import { afterUpdate, beforeUpdate, onMount } from 'svelte';
    import db from './connection';
    import {setLoading} from '../functions';
    import initClient from '../init_gapi';
    import { people_id } from '../stores';
    import getDrives from './drives';
    let keyCode, itemList;
    let lineSelected = 0;
    let PEOPLE_ID = 0;
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
	// beforeUpdate(async () => {
    //     setLoading();
    // });
    onMount(async () => {
        async function getClient(){client = new initClient()};
        await getClient().then(function(){
            let drives = new getDrives(client.PEOPLE_ID);
            drives.init()
        })
    });
    let REFRESH = false;

async function refreshContent(){
    REFRESH = true;
    setLoading().then(async function(res) {
        listDrives();
    });
}

		
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