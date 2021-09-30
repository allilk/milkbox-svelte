<script>
	import { onMount, onDestroy } from 'svelte';
	import { getStores } from '$app/stores';

	import { isAuthenticated, message, folderId, currentFolder } from '../../stores';
	import { NOT_LOGGED_IN } from '../../errors.json';

	import { formatBytes } from '../functions/other';

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
				// currentFolder.set({ ...$currentFolder, folderId: pg.params.id });
			});
		}
	});
	onDestroy(() => unsubscribe);
</script>

<div class="header">
	{#if $folderId}
		<div class="index">
			Index of /{$currentFolder.folderName}/ <span class="folder_id">({$folderId})</span>
		</div>
	{/if}
	<br />
	<button class="directory_size">
		{formatBytes($currentFolder.directorySize)}
	</button>
	<button class="file_count">
		files: {$currentFolder.fileCount}
	</button>
	<div class="login_button">
		<button id="authButton">
			{$isAuthenticated ? 'Logout' : 'Sign in'}
		</button>
	</div>
</div>

<style>
	.header {
		width: 100%;
		padding-top: 20px;
		padding-bottom: 20px;
		border-radius: 0.25rem;
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
	.login_button {
		float: right;
		margin-right: 1rem;
	}

	.directory_size {
		float: left;
		margin-left: 1rem;
		margin-right: 5px;
		font-size: 0.8rem;
	}
	.file_count {
		float: left;
	}
	.index {
		margin-left: 1rem;
		margin-right: 1rem;
		margin-bottom: 1rem;
		font-size: 1.5rem;
		padding-bottom: 10px;
		width: 100%;
	}
	.login_button,
	.index,
	.file_count,
	.directory_size {
		display: inline-block;
	}
	.folder_id {
		font-size: 1rem;
	}
	.folder_id::before {
		white-space: pre;
	}
	@media (min-width: 768px) {
		.index {
			margin-left: 2rem;
			margin-right: 2rem;

			padding-bottom: 0;
			width: auto;
		}
		.login_button {
			margin-right: 2rem;
		}
		.directory_size {
			float: none;
			margin-left: 2rem;
		}
		.file_count {
			float: none;
		}
		.folder_id::before {
			white-space: normal;
		}
	}
</style>
