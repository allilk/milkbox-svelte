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
	import { afterUpdate, beforeUpdate } from 'svelte';
	import { setLoading } from '../functions';
	import getFiles from './files';
	import initClient from '../init_gapi';
	let keyCode, itemList;
	let lineSelected = 0;
	let DISPLAY_FID = false;
	let client = new initClient();
	const createFiles = new getFiles();
	const initHeaders = async () => {
			const nameHeader = document.getElementById('sort-name');
			const sizeHeader = document.getElementById('sort-size');
			nameHeader.onclick = function(){createFiles.sortName()};
			sizeHeader.onclick = function(){createFiles.sortSize()};
		}
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
	afterUpdate(async () => {
		
		db.settings.where('user').equals(0).toArray().then(function(resp){
			if (!resp[0].displayfid || resp[0].displayfid == 'yes') {
				DISPLAY_FID = true;
			}
		});
		
		const people_id = await client.init()
		await createFiles.init(false, people_id, folder_id[0], DISPLAY_FID);

		await initHeaders();
		const refreshContent = async () => {
			setLoading();
			await createFiles.init(true, people_id, folder_id[0], DISPLAY_FID);
		}
		
		const refreshButton = document.getElementById('refresh_button');
		refreshButton.onclick = refreshContent;

		document.getElementById('show-grid').onclick = createFiles.toggleGrid;
		document.getElementById('show-list').onclick = createFiles.toggleList;
	});
</script>
<svelte:window on:keydown={handleKeydown}/>
<div class="px-4 py-12 shadow-lg top-header md:px-8 md:py-16 ">
	<span id="index-header" class="text-xl font-bold md:text-2xl"><span>index of ./<span id="dir-title"></span>/ </span></span><span class="text-lg md:text-xl file-id">({folder_id})</span>
	<br><hr><span class="text-sm font-bold">total files & folders: <span class="font-normal" id="file-count"></span>  total size (excl. folders): <span class="font-normal" id="total-size"></span></span><hr>
	<div class="mt-2">
		<span class="text-sm">quick links: </span>
		<a href="drive/root">
			<button class="px-2 py-2 font-semibold rounded-none shadow">my drive</button>
		</a>
		<a href="drive/shared-with-me" >
			<button class="px-2 py-2 font-semibold rounded-none shadow">shared with me</button>
		</a>
		<a href="drive/shared-drives">
			<button class="px-2 py-2 font-semibold rounded-none shadow">shared drives</button>
		</a>
	</div>
	<br>
</div>
<div class="px-4 shadow-inner md:px-8">
	<br>
	<div class="flex items-center">
		<div class="inline-flex flex-auto">
			<button id="authorize_button" style="display: none;" class="px-2 py-2 font-semibold rounded-none shadow">
				Authorize</button>
			<button id="signout_button" style="display: none;" class="px-2 py-2 font-semibold rounded-none shadow">
				Sign Out</button>
			<button id="refresh_button" style="display: none;" class="px-2 py-2 font-semibold rounded-none shadow">
				Refresh</button>
		</div>
		<div class="flex-auto pl-2">
			<div class="relative px-4 bg-white border">
				<input on:keyup={searchGrid} type="search" name="search" id="search_input" placeholder="Search"
						class="inline-flex w-full outline-none appearance-none focus:outline-none active:outline-none"/>
				<button type="submit" class="absolute inline-flex -ml-3 bg-transparent outline-none focus:outline-none active:outline-none hover:bg-transparent">
					<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						viewBox="0 0 24 24" class="w-6 h-6">
					<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
					</svg>
				</button>
			</div>
		</div>
		<div class="p-1 ml-1 gridlistview">
			<img id="show-grid" class="" src="svg/fi-rr-grid.svg" alt="grid" width="20">
			<img id="show-list" class="hidden" src="svg/fi-rr-list.svg" alt="list" width="20">
		</div>
	</div>
	<div class="sticky grid items-center grid-cols-6 text-sm">
		
		<div id="sort-name" class="col-span-5 py-3 font-bold animation-pulse">Name</div>
		<div id="sort-size" class="col-span-1 mr-8 font-bold text-right file-size">Size</div>
	
	
		<div id="#loading" class="col-span-full">
			<center>
				<div class="lds-ripple"><div></div><div></div></div>
			</center>
		</div>
	</div>
	<form>
		<div id="content-list" class="grid grid-cols-6 text-sm">
	
		</div>
	</form>
</div>