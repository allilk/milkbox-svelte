<script>
	import Footer from '../components/Footer.svelte';
import Nav from '../components/Nav.svelte';

	export let segment;
</script>

<style>
	main {
		margin: 0 auto;

		box-sizing: border-box;
	}
</style>

<Nav {segment}/>
<svelte:head>
	<title>📦</title>
</svelte:head>
<main>
	<slot></slot>
</main>
<Footer/>