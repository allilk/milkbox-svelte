<script context="module">
  export async function preload(page, folder_id) {
    const { slug } = page.params
    folder_id = slug
    return { folder_id }
  }
</script>

<script type="text/javascript">
  export let folder_id
  export let itemList = []
  export let search_input
  export let PEOPLE_ID

  import { onMount } from 'svelte'
  import getFiles from './files'
  import fileOperations from './operations'
  import initClient from '../init_gapi'
  import { folderId, directorySize, fileCount, fileList, isAuthenticated } from '../stores'
  import Render from '../../components/Render.svelte'

  let displaySize
  let client = new initClient()
  const createFiles = new getFiles()
  const Operate = new fileOperations()

  const addListeners = async () => {
    for (let i = 0; i < itemList.length; i++) {
      let listItem = itemList[i]
      listItem.addEventListener('contextmenu', function (ev) {
        // ev.preventDefault()
        // let fileId = listItem.getElementsByClassName('file-id')[0]
        // fileId = fileId.textContent.replace('(', '').replace(')', '')
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
  const refreshTheContent = async (folder) => {
    if (Array.isArray(folder)) {
      folder = folder[0]
    }
    fileList.set([])
    fileList.set(await createFiles.init(true, PEOPLE_ID, folder))
  }
  const goToFolder = async (folder) => {
    fileList.set([])
    window.history.replaceState({}, '', '/drive/' + folder)
    folderId.set(folder)
    fileList.set(await createFiles.init(false, PEOPLE_ID, folder))
    itemList = document.getElementsByClassName('not-selected')
  }
  const initiate = async () => {
    const people_id = await client.init()
    PEOPLE_ID = people_id
    localStorage.setItem('PEOPLE_ID', PEOPLE_ID)
  }
  const searchInDrive = async (query) => {
    // let fetchFiles = true
    // let nextPageToken
    let resultList = []
    fileList.set([])

    // while (fetchFiles) {
    const resp = await gapi.client.drive.files.list({
      q: `trashed=false and name contains '${query}'`,
      pageSize: 250,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: 'allDrives',
      orderBy: 'name_natural',
      fields: 'nextPageToken, files(name, id, parents, size, mimeType, modifiedTime, driveId, webViewLink, thumbnailLink, shortcutDetails)'
      // pageToken: nextPageToken
    })

    resultList.push(resp.result.files)
    // if (!resp.result.nextPageToken) {
    //   fetchFiles = false
    // } else {
    //   nextPageToken = resp.result.nextPageToken
    // }
    // }
    resultList = [].concat.apply([], resultList)
    resultList.forEach(async (file) => {
      let resp = await createFiles.cacheFile(file, true)
      fileList.set([...$fileList, resp])
    })
  }
  if (typeof window !== 'undefined') {
    PEOPLE_ID = localStorage.getItem('PEOPLE_ID')
  }
  onMount(async () => {
    await initiate()
  })
  isAuthenticated.subscribe(async (value) => {
    if (value) {
      // promise = []
      fileList.set([])
      window.history.replaceState({}, '', '/drive/' + folder_id[0])
      folderId.set(folder_id[0])
      fileList.set(await createFiles.init(false, PEOPLE_ID, folder_id[0]))
      itemList = document.getElementsByClassName('not-selected')
    } else {
      fileList.set([])
    }
  })
  fileList.subscribe(async (theList) => {
    let total = 0
    theList.forEach((x) => {
      total += x.size
    })
    fileCount.set(theList == 0 ? 0 : theList.length - 1)
    directorySize.set(total)
  })
  directorySize.subscribe(async (x) => {
    const formatBytes = (bytes, decimals = 2) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    }
    displaySize = formatBytes(x)
  })
</script>

<!-- Hidden context menu -->
<div id="context-menu" style="display: none;">
  <button id="go-to-parent" class="py-2 px-6"> Go to parent </button>
  <button id="go-to-webview" class="py-2 px-6"> Open in Google </button>
  <button id="download-file" class="py-2 px-6"> Download </button>
</div>

<div class="top-0 top-header pb-4 mb-2">
  <div class="py-12 mx-4 md:mx-6">
    <div class="-mb-4">
      <span id="index-header" class="text-xl font-bold md:text-2xl"><span>index of ./<span id="dir-title" />/ </span></span><span
        class="text-lg md:text-xl file-id">({$folderId})</span
      >
    </div>
    <br />
    <hr />
    <span class="text-sm font-bold">
      total files & folders: <span class="font-normal" id="file-count">{$fileCount}</span>
      total size (excl. folders): <span class="font-normal" id="total-size">{displaySize}</span>
    </span>
    <hr />
    <div class="mt-2">
      <span class="text-sm">quick links: </span>
      <button
        on:click={function () {
          goToFolder('root')
        }}
        class="px-4 py-2 font-semibold rounded-full shadow">my drive</button
      >
      <button
        on:click={function () {
          goToFolder('shared-with-me')
        }}
        class="px-4 py-2 font-semibold rounded-full shadow">shared with me</button
      >
      <a href="drive/shared-drives">
        <button class="px-4 py-2 font-semibold rounded-full shadow">shared drives</button>
      </a>
    </div>
  </div>
  <div class="mx-4 md:mx-6 my-4">
    <div class="flex items-center">
      <div class="inline-flex flex-auto">
        <button
          id="refresh_button"
          on:click={function () {
            refreshTheContent($folderId)
          }}
          style="display: none;"
          class="px-4 py-2 font-semibold rounded-full shadow"
        >
          Refresh</button
        >
      </div>
      <div class="flex-auto pl-2">
        <div class="relative px-4 bg-white border rounded-full">
          <input
            bind:value={search_input}
            on:keyup={searchGrid}
            type="search"
            name="search"
            id="search_input"
            placeholder="Search"
            class="inline-flex w-full  outline-none appearance-none focus:outline-none active:outline-none"
          />
          <button
            on:click={searchInDrive(search_input, folder_id[0])}
            type="submit"
            class="absolute inline-flex -ml-3 bg-transparent outline-none focus:outline-none active:outline-none hover:bg-transparent"
          />
        </div>
      </div>
      <div class="p-2 ml-1 flex space-x-4">
        <div class="flex-1">
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
        </div>
        <div class="gridlistview flex-1">
          <img on:click={createFiles.toggleGrid} id="show-grid" class="svg-tag" src="svg/fi-rr-grid.svg" alt="grid" width="23" />

          <img on:click={createFiles.toggleList} id="show-list" class="svg-tag hidden" src="svg/fi-rr-list.svg" alt="list" width="23" />
        </div>
      </div>
    </div>
  </div>
</div>
<br />

<div class="mx-3">
  {#await $fileList}
    awaiting..
  {:then val}
    <Render {itemList} promise={val} />
  {:catch error}
    {error.message}
  {/await}
</div>
