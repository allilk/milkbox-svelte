<script>
	import { onMount, onDestroy } from 'svelte';
	import { getStores } from '$app/stores';

	import { isAuthenticated, message, folderId } from '../../stores';
	import { NOT_LOGGED_IN } from '../../errors.json';

	import initClient from '../functions/authenticate';

	const client = new initClient();
	const { page } = getStores();
	let unsubscribe;
	onMount(() => {
		client.initiate();
	});
	isAuthenticated.subscribe((x) => {
		if (!x) {
			message.set(NOT_LOGGED_IN);
		} else {
			message.set('');
			unsubscribe = page.subscribe((pg) => {
				folderId.set(pg.params.id);
			});
		}
	});
	onDestroy(() => unsubscribe);
</script>

<div>
	{$isAuthenticated}
	<button id="authButton">
		{$isAuthenticated ? 'Logout' : 'Sign in'}
	</button>
</div>
