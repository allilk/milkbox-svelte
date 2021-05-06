<script>
  import Drive from './Drive.svelte'
  export let promise
</script>

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
