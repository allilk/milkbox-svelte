<script context="module">
  export async function preload(page, folder_id) {
    const { slug } = page.params
    folder_id = slug
    return { folder_id }
  }
</script>

<script type="text/javascript">
  export let folder_id
  export let promise = []
  export let itemList = []
  import { onMount } from 'svelte'
  import getFiles from './files'
  import fileOperations from './operations'
  import initClient from '../init_gapi'
  import { folderId, isAuthenticated } from '../stores'

  import Header from '../../components/Header.svelte'

  export let PEOPLE_ID

  let client = new initClient()
  const createFiles = new getFiles()
  const Operate = new fileOperations()
  const searchGrid = async () => {
    let searchInput = document.getElementById('search_input').value.toUpperCase()
    itemList = document.getElementsByClassName('not-selected')
    try {
      Array.prototype.forEach.call(itemList, (listItem) => {
        if (listItem !== undefined) {
          if (listItem.innerText.toUpperCase().indexOf(searchInput) > -1) {
            listItem.style.display = ''
          } else {
            listItem.style.display = 'none'
          }
        }
      })
    } catch {}
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

        let goToWebView = contextMenu.childNodes[2]
        goToWebView.onclick = async function () {
          window.open(listItem.getAttribute('webview'))
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
  // const searchFiles = async () => {
  //   console.log('Running search')
  //   setLoading()
  //   let query = document.getElementById('search_input')
  //   itemList = await createFiles.init(false, PEOPLE_ID, 'null', DISPLAY_FID, 1, 'false', query.value)
  //   addListeners()
  //   window.location.hash = '#search'
  // }
  const refreshTheContent = async (folder) => {
    if (Array.isArray(folder)) {
      folder = folder[0]
    }
    promise = []
    promise = await createFiles.init(true, PEOPLE_ID, folder)
  }
  const goToFolder = async (folder) => {
    promise = []

    window.history.replaceState({}, '', '/drive/' + folder)
    folderId.set(folder)

    promise = await createFiles.init(false, PEOPLE_ID, folder)

    itemList = document.getElementsByClassName('not-selected')
  }
  import Render from '../../components/Render.svelte'

  const initiate = async () => {
    const people_id = await client.init()
    PEOPLE_ID = people_id
    localStorage.setItem('PEOPLE_ID', PEOPLE_ID)
    
  }

  if (typeof window !== 'undefined') {
    PEOPLE_ID = localStorage.getItem('PEOPLE_ID')
  }
  onMount(async () => {
    await initiate()
  })
  isAuthenticated.subscribe(async (value) => {
    if (value) {
      promise = []
      window.history.replaceState({}, '', '/drive/' + folder_id[0])
      folderId.set(folder_id[0])

      promise = await createFiles.init(false, PEOPLE_ID, folder_id[0])
      itemList = document.getElementsByClassName('not-selected')
    } else {
      promise = []
    }
  })
</script>

<!-- Hidden context menu -->
<div id="context-menu" style="display: none;">
  <button id="go-to-parent" class="py-2 px-6"> Go to parent </button>
  <button id="go-to-webview" class="py-2 px-6"> Open in Google </button>
  <button id="download-file" class="py-2 px-6"> Download </button>
</div>

<Header {PEOPLE_ID} />

<div class="px-4 py-12 shadow-lg top-header md:px-8">
  <div class="-mb-4">
    <span id="index-header" class="text-xl font-bold md:text-2xl"><span>index of ./<span id="dir-title" />/ </span></span><span
      class="text-lg md:text-xl file-id">({$folderId})</span
    >
  </div>
  <br />
  <hr />
  <span class="text-sm font-bold"
    >total files & folders: <span class="font-normal" id="file-count" /> total size (excl. folders):
    <span class="font-normal" id="total-size" /></span
  >
  <hr />
  <div class="mt-2">
    <span class="text-sm">quick links: </span>
    <button
      on:click={function () {
        goToFolder('root')
      }}
      class="px-2 py-2 font-semibold rounded-none shadow">my drive</button
    >
    <button
      on:click={function () {
        goToFolder('shared-with-me')
      }}
      class="px-2 py-2 font-semibold rounded-none shadow">shared with me</button
    >
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
      <button
        id="refresh_button"
        on:click={function () {
          refreshTheContent($folderId)
        }}
        style="display: none;"
        class="px-2 py-2 font-semibold rounded-none shadow"
      >
        Refresh</button
      >
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
        <!-- <button
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
        </button> -->
      </div>
    </div>
    <div class="p-2 ml-1 gridlistview">
      <img on:click={createFiles.toggleGrid} id="show-grid" class="" src="svg/fi-rr-grid.svg" alt="grid" width="20" />
      <img on:click={createFiles.toggleList} id="show-list" class="hidden" src="svg/fi-rr-list.svg" alt="list" width="20" />
    </div>
  </div>
  {#await promise}
    awaiting..
  {:then val}
    <Render {itemList} promise={val} />
  {:catch error}
    {error.message}
  {/await}
</div>
