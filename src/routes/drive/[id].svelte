<script>
	import { currentFolder, folderId } from '../../stores';

	import Header from '../../components/drive/Header.svelte';
	import Message from '../../components/Message.svelte';
	import Browser from '../../components/drive/Browser.svelte';
</script>

<link href="/styles/files.css" rel="stylesheet" />

<Header />
<Message />
<div>
	<div>
		{#if $folderId}
			<Browser />
		{/if}
	</div>
</div>
