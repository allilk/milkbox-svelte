
<button id="authorize_button" style="display: none;">Authorize</button>
<button id="signout_button" style="display: none;">Sign Out</button>

<pre id="content" style="white-space: pre-wrap;"></pre>

<script type="text/javascript">
	import { onMount } from 'svelte';
	onMount(async () => {
		window.location.replace('browser/root')
	});
</script>

