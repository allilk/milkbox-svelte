<script>
	import { formatBytes } from '../functions/other';

	export let size;
	export let formattedSize;

	// Format size from bytes to human readable
	$: formattedSize = size ? formatBytes(size) : '0 B';
</script>

<div class="file contents">
	<div class="file-name">
		<slot name="name">
			<span class="missing"> null </span>
		</slot>
	</div>
	<span contenteditable="true" bind:textContent={size} hidden>
		<slot name="size" />
	</span>
	<div class="file-size">
		{formattedSize}
	</div>
</div>
