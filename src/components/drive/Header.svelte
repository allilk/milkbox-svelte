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
	import { goto } from '$app/navigation';
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

<div class="top-header">
	<button
		id="homeIcon"
		on:click={() => {
			goto('/');
		}}>H</button
	>
	<button
		id="driveButton"
		on:click={() => {
			goto('/drive/root');
		}}>Drives</button
	>
	<div class="title">milkbox</div>

	<!-- Display login button -->
	<div class="login_button">
		<button id="authButton">
			{$isAuthenticated ? 'Logout' : 'Login'}
		</button>
	</div>
	<button
		id="settingIcon"
		on:click={() => {
			goto('/settings');
		}}>S</button
	>
</div>
<!-- Display index, directory size, and file count when there is a folder id and logged in -->
{#if $folderId && $isAuthenticated}
	<div class="header">
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
	</div>
{:else}
	<h2>
		{#if $page.path == '/privacy-policy'}
			Privacy Policy
		{:else if $page.path == '/terms-of-service'}
			Terms Of Service
		{:else if $page.path == '/settings'}
			Settings
		{:else}
			Home
		{/if}
	</h2>
	<hr />
{/if}

<style>
	.top-header,
	.header {
		width: 100%;
		border-radius: 0.25rem;
	}
	.top-header {
		margin-top: 1rem;
		padding-bottom: 10px;
	}
	.top-header button {
		padding: 10px 16px 10px 16px;
	}
	.header {
		font-size: var(--header);

		overflow-x: hidden;
		padding-top: 20px;
		padding-bottom: 20px;
		margin-bottom: 1rem;
	}
	.login_button,
	#settingIcon {
		float: right;
	}
	#homeIcon {
		float: left;
	}
	.title,
	.login_button,
	#settingIcon,
	#homeIcon,
	#driveButton,
	.file_count,
	.directory_size {
		display: inline-block;
	}
	.directory_size {
		float: left;
		margin-left: 1rem;
		margin-right: 5px;
	}
	.index {
		margin-left: 1rem;
		margin-right: 1rem;
		margin-bottom: 1rem;
		padding-bottom: 10px;
		width: 100%;
	}

	.folder_id {
		color: var(--color-1);
		font-size: var(--secondary);
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

		.directory_size {
			margin-left: 2rem;
		}
	}
</style>
