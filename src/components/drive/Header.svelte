<script>
	import { onMount } from 'svelte';

	import { isAuthenticated, message, folderId, currentFolder } from '../../stores';
	import { NOT_LOGGED_IN } from '../../errors.json';
	import { formatBytes } from '../functions/other';
	// the client
	import initClient from '../functions/authenticate';
	const client = new initClient();
	// the current page
	import { getStores } from '$app/stores';
	const { page } = getStores();

	onMount(() => {
		// initiate the client and load gapi
		client.initiate();
	});
	isAuthenticated.subscribe((x) => {
		if (!x) {
			// set message when not logged in
			message.set(NOT_LOGGED_IN);
		} else {
			// clear not logged in message
			message.set('');
			// set folderId when the page changes
			page.subscribe((pg) => {
				folderId.set(pg.params.id);
			});
		}
	});
</script>

<div class="header">
	<!-- Display index, directory size, and file count when there is a folder id and logged in -->
	{#if $folderId && $isAuthenticated}
		<div class="index">
			Index of /{$currentFolder.folderName}/ <span class="folder_id">( {$folderId} )</span>
		</div>
		<!-- Display directory size -->
		<button class="directory_size">
			{formatBytes($currentFolder.directorySize)}
		</button>
		<!-- Display file count -->
		<button class="file_count">
			files: {$currentFolder.fileCount}
		</button>
	{/if}
	<!-- Display login button -->
	<div class="login_button">
		<button id="authButton">
			{$isAuthenticated ? 'Logout' : 'Login'}
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
		overflow-x: hidden;
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
		padding-bottom: 10px;
		width: 100%;
		font-size: 1.5rem;
	}
	.login_button,
	.index,
	.file_count,
	.directory_size {
		display: inline-block;
	}
	.folder_id {
		font-size: 1rem;
		color: var(--color-1);
	}
	.folder_id::before {
		content: '\A';
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
		/* .folder_id::before {
			content: 
		} */
	}
</style>
