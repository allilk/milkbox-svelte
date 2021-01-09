<script>
	import Nav from '../components/Nav.svelte';

	export let segment;
</script>

<style>
	main {
		margin: 0 auto;
		margin-left: 10px;
		box-sizing: border-box;
	}
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>