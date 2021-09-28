<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { afterUpdate } from 'svelte';

	import { fileList, folderId } from '../../stores';
	import { getFiles, getParent } from '../functions/files';
	import File from './File.svelte';
	import Folder from './Folder.svelte';
	import Header from './Header.svelte';

	export let parentId;

	const getNext = async (identifier) => {
		fileList.set([]);

		parentId = await getParent(identifier);
		const res = await getFiles(identifier);
		fileList.set(res);

		window.history.replaceState({}, '', '/drive/' + identifier);
	};

	$: getNext($folderId);

	afterUpdate(() => folderId.update(() => $page.params.id));
</script>

<div class="list">
	{#if $fileList.length == 0}
		Loading...
	{:else}
		<div class="contents" on:click={goto('/drive/' + parentId)}>
			<Folder>
				<span slot="name"> .. </span>
			</Folder>
		</div>
	{/if}

	{#each $fileList as item}
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
	{/each}
</div>
