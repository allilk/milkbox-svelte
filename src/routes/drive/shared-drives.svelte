<script>
  import { afterUpdate, beforeUpdate, onMount } from 'svelte'
  import { setLoading } from '../functions'
  import initClient from '../init_gapi'
  import getDrives from './drives'

  let keyCode, itemList
  let lineSelected = 0
  let PEOPLE_ID

  const refreshContent = async () => {
    setLoading()
	itemList = await createDrives.init(PEOPLE_ID, true)
  }
  const searchGrid = () => {
    let input, filter, contentList, flex, listitem, i, txtValue
    input = document.getElementById('search_input')
    filter = input.value.toUpperCase()
    contentList = document.getElementById('content-list')
    flex = contentList.getElementsByClassName('drive-obj')
    for (i = 0; i < flex.length; i++) {
      listitem = flex[i].getElementsByTagName('div')[0]
      if (listitem) {
        txtValue = listitem.textContent || listitem.innerText
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          flex[i].style.display = ''
        } else {
          flex[i].style.display = 'none'
        }
      }
    }
  }
  const handleKeydown = async (event) => {
    // Im not going to nitpick but you can reduce the nestedness of the code
    // By using "early returns" here
    keyCode = event.keyCode
    if (keyCode == 83 || keyCode == 40) {
      if (lineSelected < itemList.length - 1) {
        if (typeof itemList[lineSelected] != undefined) {
          itemList[lineSelected].classList.remove('drive-select')
        }
        lineSelected += 1
        let objSelected = itemList[lineSelected]
        objSelected.classList.add('drive-select')
        let obj = document.getElementsByClassName('drive-select')[0]
        obj.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else if (keyCode == 87 || keyCode == 38) {
      if (lineSelected > 0) {
        if (typeof itemList[lineSelected] != undefined) {
          itemList[lineSelected].classList.remove('drive-select')
        }
        lineSelected -= 1
        let objSelected = itemList[lineSelected]
        objSelected.classList.add('drive-select')
        let obj = document.getElementsByClassName('drive-select')[0]
        obj.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else if (keyCode == 13) {
      event.preventDefault()
      let selObj = document.getElementsByClassName('drive-select')[0]
      selObj.click()
    }
  }

  let client = new initClient()
  let createDrives = new getDrives()
  beforeUpdate(async () => {
    setLoading()
  })
  afterUpdate(async () => {
    const people_id = await client.init()
	PEOPLE_ID = people_id
    itemList = await createDrives.init(PEOPLE_ID)

	const refreshButton = document.getElementById('refresh_button')
    refreshButton.onclick = refreshContent
  })
  // same issue, the undefined `this`?
  // strange cause this is how classes work, no pun intended

  // async function refreshContent(){
  //     REFRESH = true;
  //     setLoading().then(async function(res) {
  //         listDrives();
  //     });
  // }
</script>

<svelte:window on:keydown={handleKeydown} />
<div class="px-8 py-16 shadow-lg top-header sm:py-12 ">
  <span id="index-header" class="text-2xl">my shared drives <span id="total-drives" class="text-gray-500 " /></span>
  <br />
  <hr />
  <div class="mt-2">
    <span class="text-sm">quick links: </span>
    <a href="drive/root">
      <button class="px-2 py-2 font-semibold rounded-none shadow">my drive</button>
    </a>
    <a href="drive/shared-with-me">
      <button class="px-2 py-2 font-semibold rounded-none shadow">shared with me</button>
    </a>
    <a href="drive/shared-drives">
      <button class="px-2 py-2 font-semibold rounded-none shadow">shared drives</button>
    </a>
  </div>
  <br />
</div>
<div class="px-4 overflow-x-hidden shadow-inner md:px-8 whitespace-nowrap">
  <br />
  <div class="flex items-center">
    <div class="inline-flex flex-auto">
      <button id="authorize_button" style="display: none;" class="px-2 py-2 font-semibold rounded-none shadow"> Authorize</button>
      <button id="signout_button" style="display: none;" class="px-2 py-2 font-semibold rounded-none shadow"> Sign Out</button>
      <button id="refresh_button" style="display: none;" class="px-2 py-2 font-semibold rounded-none shadow"> Refresh</button>
    </div>
    <div class="flex-auto pl-2">
      <div class="relative px-4 bg-white border">
        <input
          on:keyup={searchGrid}
          type="search"
          name="search"
          id="search_input"
          placeholder="Search"
          class="inline-flex w-full outline-none appearance-none focus:outline-none active:outline-none"
        />
        <button
          type="submit"
          class="absolute inline-flex -ml-3 bg-transparent outline-none focus:outline-none active:outline-none hover:bg-transparent"
        >
          <svg
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            class="w-6 h-6"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
  <div class="sticky grid grid-cols-1 px-4 text-sm md:grid-cols-2 md:px-8">
    <div id="#loading" class="col-span-full">
      <center>
        <div class="lds-ripple">
          <div />
          <div />
        </div>
      </center>
    </div>
  </div>
  <br />

  <div id="content-list" class="grid grid-cols-1 md:grid-cols-2" />
</div>
