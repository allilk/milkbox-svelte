<script>
  import Drive from './Drive.svelte'

  export let promise = []
  export let show_hidden = true
  export let show_unhidden = true

  const showUnhidden = async () => {
    let itemList = document.getElementsByClassName('drive-obj')
    if (!show_hidden) {
      for (const driveObj of itemList) {
        if (driveObj.getAttribute('is_hidden') == 'false') {
          driveObj.classList.remove('hidden')
        }
      }
    } else {
      for (const driveObj of itemList) {
        if (driveObj.getAttribute('is_hidden') == 'false') {
          driveObj.classList.add('hidden')
        }
      }
    }
  }
  const showHidden = async () => {
    let itemList = document.getElementsByClassName('drive-obj')
    if (!show_hidden) {
      for (const driveObj of itemList) {
        if (driveObj.getAttribute('is_hidden') == 'true') {
          driveObj.classList.remove('hidden')
        }
      }
    } else {
      for (const driveObj of itemList) {
        if (driveObj.getAttribute('is_hidden') == 'true') {
          driveObj.classList.add('hidden')
        }
      }
    }
  }
</script>

<div class="inline-flex">
  <div class="flex-auto my-2 p-2">
    Show Hidden Drives
    <input type="checkbox" on:change={showHidden} bind:checked={show_hidden} />
  </div>
  <div class="flex-auto my-2 p-2">
    Show Unhidden Drives
    <input type="checkbox" on:change={showUnhidden} bind:checked={show_unhidden} />
  </div>
</div>
<div id="content-list" class="grid grid-cols-1 md:grid-cols-2">
  {#await promise}
    <div />
  {:then promisee}
    {#each promisee as item}
      <Drive {...item} />
    {/each}
    {#if promisee == 0}
      <div id="#loading" class="col-span-full">
        <center>
          <div class="lds-ripple">
            <div />
            <div />
          </div>
        </center>
      </div>
    {/if}
  {:catch error}
    <p>{error}</p>
  {/await}
</div>
