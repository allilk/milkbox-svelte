<script>
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