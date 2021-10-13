<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { currentDrives } from '../../stores';

	import { getDrives } from '../functions/drives';

	import Drive from './Drive.svelte';

	const getNext = async () => {
		const drives = await getDrives();

		currentDrives.set({ ...$currentDrives, loaded: true, driveList: drives });
		console.log($currentDrives);
	};
	$: getNext();
</script>

<div>
	{#if !$currentDrives.loaded}
		Loading...
	{/if}
	{#each $currentDrives.driveList as item}
		<div
			on:click={() => {
				goto('/drive/' + item.id);
			}}
		>
			<Drive>
				<span slot="name">
					{item.name}
				</span>
			</Drive>
		</div>
	{/each}
</div>
