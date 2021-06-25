<!-- <script>
  import { folderId, isAuthenticated } from '../stores'

  export let folderId

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

</script>

<div class="top-header rounded-b-3xl pb-4 mx-2 -mb-2">
  <div class="py-12 mx-4 md:mx-6">
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
            on:keyup={searchGrid}
            type="search"
            name="search"
            id="search_input"
            placeholder="Search"
            class="inline-flex w-full  outline-none appearance-none focus:outline-none active:outline-none"
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
            </button> -->
<!-- </div>
      </div>
      <div class="p-2 ml-1 gridlistview">
        <img on:click={createFiles.toggleGrid} id="show-grid" class="svg-tag" src="svg/fi-rr-grid.svg" alt="grid" width="20" />
        <img on:click={createFiles.toggleList} id="show-list" class="svg-tag hidden" src="svg/fi-rr-list.svg" alt="list" width="20" />
      </div>
    </div>
  </div>
</div> -->
