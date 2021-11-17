<script>
	import Header from '../components/drive/Header.svelte';
	import Footer from '../components/drive/Footer.svelte';
	import Switch from '../components/Switch.svelte';

	let displayFolderIds = false;
</script>

<div>
	<Header />
	<div class="header">
		<div class="">Settings</div>
	</div>
	<div class="list">
		<div>
			<h2>Visual</h2>
			<hr />
		</div>
		<div class="list">
			<div class="setting-option">
				<span>Theme:</span>
				<Switch bind:checked={displayFolderIds} />
			</div>
			<br />
			<div class="setting-option">
				<span>Display Folder IDs:</span>
				<Switch bind:checked={displayFolderIds} />
			</div>
			<br />
			<div class="setting-option">
				<span>Show File IDs:</span>
				<Switch bind:checked={displayFolderIds} />
			</div>
			<br />
			<div class="setting-option">
				<span>Display Larger Previews:</span>
				<Switch bind:checked={displayFolderIds} />
			</div>
			<br />
		</div>
		<div>
			<h2>Other</h2>
			<hr />
		</div>
		<div class="list">
			<div class="setting-option">
				<span>Cache Preview Images:</span>
				<Switch bind:checked={displayFolderIds} />
			</div>
			<br />
		</div>
	</div>
	<br />
	<Footer />
</div>

<style>
	.header {
		width: 100%;
		border-radius: 0.25rem;
		font-size: var(--header);
		overflow-x: hidden;
		padding-top: 20px;
		padding-bottom: 20px;
		margin-bottom: 1rem;
	}
	.header > div {
		margin-left: 1rem;
		margin-right: 1rem;
		width: 100%;
	}
	hr {
		margin-bottom: 1rem;
	}
	.setting-option {
		display: inline-flex;
		margin-bottom: 0.5rem;
		margin-top: 0.5rem;
	}
	.setting-option > span {
		margin-right: 1rem;
		font-size: var(--primary);
		font-weight: 600;
	}
	@media (min-width: 768px) {
		.header > div {
			margin-left: 2rem;
			margin-right: 2rem;
			width: auto;
		}
	}
</style>
