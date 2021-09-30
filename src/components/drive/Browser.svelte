<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { afterUpdate } from 'svelte';

	import { folderId, currentFolder } from '../../stores';
	import { getFiles, getParent } from '../functions/files';

	import File from './File.svelte';
	import Folder from './Folder.svelte';

	const resetStore = () => {
		currentFolder.set({
			folderName: '',
			directorySize: 0,
			fileCount: 0,
			fileList: [],
			parentId: ''
		});
	};
	const getNext = async (identifier) => {
		resetStore();
		const files = await getFiles(identifier);
		const parent = await getParent(identifier);
		let directorySize = 0;
		files.forEach((file) => {
			directorySize += parseInt(file.size) || 0;
		});
		currentFolder.set({
			folderName: parent.name,
			directorySize: directorySize,
			fileCount: files.length,
			fileList: files,
			parentId: parent.id
		});
		console.log($currentFolder);
		window.history.replaceState({}, '', '/drive/' + identifier);
	};

	$: getNext($folderId);

	afterUpdate(() => folderId.update(() => $page.params.id));
</script>

<div class="list">
	{#if $currentFolder.fileCount == 0}
		Loading...
	{:else}
		<div class="contents" on:click={goto('/drive/' + $currentFolder.parentId)}>
			<Folder>
				<span slot="name"> .. </span>
			</Folder>
		</div>
	{/if}

	{#each $currentFolder.fileList as item}
		<div class="contents list-item">
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
