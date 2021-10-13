<script>
	import Header from '../../components/drive/Header.svelte';
	import Footer from '../../components/drive/Footer.svelte';

	import Message from '../../components/Message.svelte';
	import Drives from '../../components/drive/Drives.svelte';

	import { currentDrives } from '../../stores';
</script>

<link href="/styles/files.css" rel="stylesheet" />

<Header />
<Message />
<div>
	<div>
		{#if $currentDrives.load}
			<Drives />
		{/if}
	</div>
</div>
<Footer />
