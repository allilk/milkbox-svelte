<script>
  import { onMount } from 'svelte'
  import db from '../routes/drive/connection'
  import { isAuthenticated } from '../routes/stores'
  import initClient from '../routes/init_gapi'
  import { goto } from '@sapper/app'

  let selectedTheme = 'dark-theme'

  let PROFILE_PIC, USER_NAME, PEOPLE_ID
  let hideMe = 'hidden'
  let hideMe2 = 'hidden'
  let client = new initClient()

  const setDefaults = async () => {
    const res = await db.settings.where('user').equals(0).toArray()
    let userDefaults = res[0]
    selectedTheme = userDefaults.theme
  }
  const initiate = async () => {
    const people_id = await client.init()
    PEOPLE_ID = people_id
    localStorage.setItem('PEOPLE_ID', PEOPLE_ID)
  }
  onMount(async () => {
    isAuthenticated.subscribe(async (value) => {
      if (value == true) {
        hideMe = ''
        hideMe2 = 'hidden'
      } else {
        hideMe = 'hidden'
        hideMe2 = ''
      }
    })
    await initiate()
    USER_NAME = localStorage.getItem('USER_NAME')
    PROFILE_PIC = localStorage.getItem('PROFILE_PIC')
    await setDefaults()
  })
</script>

<!-- Set theme -->
<svelte:head>
  <link id="current-theme" rel="stylesheet" href="{selectedTheme}.css" />
</svelte:head>
<center>
  <div class=" w-full ">
    <button
      on:click={() => {
        goto('http://rewrite.milk.ovh')
      }}
      class="px-8 py-4  w-full text-black text-lg bg-red-300 hover:bg-red-700 ..."
    >
      Check Out The Rewrite!
    </button>
  </div>
</center>
<div class="flex items-center">
  <div class="absolute right-0 mt-20 pr-4 inline-flex space-x-4">
    {#if PEOPLE_ID}
      <img
        src={PROFILE_PIC}
        class="rounded-fullh-8 w-8 hover:scale-110 transform transition cursor-pointer"
        alt=""
        title="Signed in as {USER_NAME} ({PEOPLE_ID})"
      />
    {/if}
    <a href="/settings" rel="prefetch">
      <img id="settings" class="svg-tag h-8 w-8 hover:scale-110 transform transition mx-3" src="svg/settings.svg" alt="settings" /></a
    >
    <div class="contents {hideMe}">
      <button id="signout_button" class="px-4 ml-3 font-semibold rounded-full shadow"> Sign Out</button>
    </div>
    <div class="contents {hideMe2}">
      <button id="authorize_button" class="px-4 mx-3 font-semibold rounded-full shadow"> Sign In</button>
    </div>
  </div>
</div>
