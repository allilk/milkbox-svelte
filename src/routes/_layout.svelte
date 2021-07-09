<script>
  import Footer from '../components/Footer.svelte'
  import Nav from '../components/Nav.svelte'
  import Header from '../components/Header.svelte'
  export let segment
</script>
<Header />
<Nav {segment} />


<svelte:head>
  <title>📦</title>
</svelte:head>
<main>
  <slot />
</main>
<Footer />

<style>
  main {
    margin: 0 auto;

    box-sizing: border-box;
  }
</style>
