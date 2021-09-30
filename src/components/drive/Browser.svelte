<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { afterUpdate } from 'svelte';

	import { folderId, currentFolder } from '../../stores';
	import { getFiles, getParent } from '../functions/files';

	import File from './File.svelte';
	import Folder from './Folder.svelte';

	const resetStore = () => {
		// Set currentFolder to empty
		currentFolder.set({
			folderName: '',
			directorySize: 0,
			fileCount: 0,
			fileList: [],
			parentId: ''
		});
	};
	const getNext = async (identifier) => {
		// Reset store to empty, to display loading icon
		resetStore();
		// Get new data
		const files = await getFiles(identifier);
		const parent = await getParent(identifier);
		// Calculate directory size
		let directorySize = 0;
		files.forEach((file) => {
			directorySize += parseInt(file.size) || 0;
		});
		// Set new data to the store
		currentFolder.set({
			folderName: parent.name,
			directorySize: directorySize,
			fileCount: files.length,
			fileList: files,
			parentId: parent.id
		});
		// Add page to history, for back button support
		window.history.replaceState({}, '', '/drive/' + identifier);
	};
	// Grab new files when store is updated
	$: getNext($folderId);
	// Set folderId when state is updated
	afterUpdate(() => folderId.update(() => $page.params.id));
</script>

<div class="list">
	<!-- While no files, show loading icon, then show the return link -->
	{#if $currentFolder.fileCount == 0}
		Loading...
	{:else}
		<div class="contents" on:click={goto('/drive/' + $currentFolder.parentId)}>
			<Folder>
				<span slot="name"> .. </span>
			</Folder>
		</div>
	{/if}

	<!-- Display each file, in a list, with slots -->
	{#each $currentFolder.fileList as item}
		<div class="contents list-item">
			<!-- If file is a folder, render as a different object to signify this. -->
			{#if item.mimeType == 'application/vnd.google-apps.folder' || item.mimeType == 'application/vnd.google-apps.shortcut'}
				<div class="contents" on:click={goto('/drive/' + item.id)}>
					<Folder>
						<span slot="name">
							{item.name}
						</span>
					</Folder>
				</div>
			{:else}
				<File>
					<span slot="name">
						{item.name}
					</span>
					<span slot="size">
						{item.size}
					</span>
				</File>
			{/if}
		</div>
	{/each}
</div>
