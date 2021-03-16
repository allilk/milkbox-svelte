<script context="module">
  export async function preload(page, folder_id) {
    const { slug } = page.params
    folder_id = slug
    return { folder_id }
  }
</script>

<script type="text/javascript">
  export let folder_id
  import db from './connection'
  import { afterUpdate, beforeUpdate } from 'svelte'
  import { setLoading } from '../functions'
  import getFiles from './files'
  import fileOperations from './operations'
  import initClient from '../init_gapi'
  let keyCode, itemList
  let lineSelected = 0
  let DISPLAY_FID = false
  let client = new initClient()
  let PEOPLE_ID
  const createFiles = new getFiles()
  const Operate = new fileOperations()
  const searchGrid = async () => {
    let searchInput = document.getElementById('search_input').value.toUpperCase()
    Array.prototype.forEach.call(itemList, (listItem) => {
      if (listItem) {
        if (listItem.innerText.toUpperCase().indexOf(searchInput) > -1) {
          listItem.style.display = ''
        } else {
          listItem.style.display = 'none'
        }
      }
    })
  }
  const addListeners = async () => {
    for (let i = 0; i < itemList.length; i++) {
      let listItem = itemList[i]
      listItem.addEventListener('contextmenu', function (ev) {
        ev.preventDefault()
        let fileId = listItem.getElementsByClassName('file-id')[0]
        fileId = fileId.textContent.replace('(', '').replace(')', '')
        let contextMenu = document.getElementById('context-menu')
        let goToParent = contextMenu.childNodes[0]
        goToParent.onclick = async function () {
          let parentF = await Operate.returnParent(listItem.id)
		  window.location.href = `drive/${parentF}`
        }
        if (contextMenu.style.display === 'none') {
          contextMenu.style.left = `${ev.pageX}px`
          contextMenu.style.top = `${ev.pageY}px`
          contextMenu.style.display = 'block'
        } else {
          contextMenu.style.display = 'none'
        }
      })
    }
  }
  const searchFiles = async () => {
    console.log('Running search')
    setLoading()
    let query = document.getElementById('search_input')
    itemList = await createFiles.init(false, PEOPLE_ID, 'null', DISPLAY_FID, 1, 'false', query.value)
    addListeners()
    window.location.hash = '#search'
  }
  const initHeaders = async () => {
    // Sort by name header
    document.getElementById('sort-name').onclick = function () {
      createFiles.sortName()
    }
    // Sort by size header
    document.getElementById('sort-size').onclick = function () {
      createFiles.sortSize()
    }
    // Toggle grid/list
    document.getElementById('show-grid').onclick = createFiles.toggleGrid
    document.getElementById('show-list').onclick = createFiles.toggleList
  }
  const refreshContent = async () => {
    setLoading()
    itemList = await createFiles.init(true, PEOPLE_ID, folder_id[0], DISPLAY_FID)
  }
  const handleKeydown = async (event) => {
    keyCode = event.keyCode
    if (keyCode == 83 || keyCode == 40) {
      if (lineSelected < itemList.length - 1) {
        if (typeof itemList[lineSelected] != undefined) {
          itemList[lineSelected].classList.remove('selected')
        }
        lineSelected += 1
        let objSelected = itemList[lineSelected]
        objSelected.classList.add('selected')
        let obj = document.getElementsByClassName('selected')[0]
        obj.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else if (keyCode == 87 || keyCode == 38) {
      if (lineSelected > 0) {
        if (typeof itemList[lineSelected] != undefined) {
          itemList[lineSelected].classList.remove('selected')
        }
        lineSelected -= 1
        let objSelected = itemList[lineSelected]
        objSelected.classList.add('selected')
        let obj = document.getElementsByClassName('selected')[0]
        obj.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else if (keyCode == 13) {
      try {
        event.preventDefault()
        let selObj = document.getElementsByClassName('selected')[0]
        let linkObj = selObj.getElementsByTagName('a')[0]
        linkObj.click()
      } catch {}
    }
  }

  beforeUpdate(async () => {
    setLoading()
  })
  afterUpdate(async () => {
    db.settings
      .where('user')
      .equals(0)
      .toArray()
      .then(function (resp) {
        if (!resp[0].displayfid || resp[0].displayfid == 'yes') {
          DISPLAY_FID = true
        }
      })

    const people_id = await client.init()
    PEOPLE_ID = people_id
    itemList = await createFiles.init(false, people_id, folder_id[0], DISPLAY_FID)
    addListeners()
    await initHeaders()

    const refreshButton = document.getElementById('refresh_button')
    refreshButton.onclick = refreshContent
    const searchBox = document.getElementById('search_input')
    searchBox.onkeyup = searchGrid
  })
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Hidden context menu -->
<div id="context-menu" style="display: none;">
  <button id="go-to-parent" class="py-2 px-6"> Go to parent </button>
</div>

<div class="px-4 py-12 shadow-lg top-header md:px-8 md:py-16 ">
  <span id="index-header" class="text-xl font-bold md:text-2xl"><span>index of ./<span id="dir-title" />/ </span></span><span
    class="text-lg md:text-xl file-id">({folder_id})</span
  >
  <br />
  <hr />
  <span class="text-sm font-bold"
    >total files & folders: <span class="font-normal" id="file-count" /> total size (excl. folders):
    <span class="font-normal" id="total-size" /></span
  >
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
<div class="px-4 shadow-inner md:px-8">
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
          type="search"
          name="search"
          id="search_input"
          placeholder="Search"
          class="inline-flex w-full outline-none appearance-none focus:outline-none active:outline-none"
        />
        <button
          on:click={searchFiles}
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
    <div class="p-1 ml-1 gridlistview">
      <img id="show-grid" class="" src="svg/fi-rr-grid.svg" alt="grid" width="20" />
      <img id="show-list" class="hidden" src="svg/fi-rr-list.svg" alt="list" width="20" />
    </div>
  </div>
  <div class="sticky grid items-center grid-cols-6 text-sm">
    <div id="sort-name" class="col-span-5 py-3 font-bold animation-pulse">Name</div>
    <div id="sort-size" class="col-span-1 mr-8 font-bold text-right file-size">Size</div>

    <div id="#loading" class="col-span-full">
      <center>
        <div class="lds-ripple">
          <div />
          <div />
        </div>
      </center>
    </div>
  </div>
  <form>
    <div id="content-list" class="grid grid-cols-6 text-sm" />
  </form>
</div>
