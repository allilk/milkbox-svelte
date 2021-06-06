<script>
	export let selected_theme = 'dark-theme';
	export let segment;
    import db from '../routes/drive/connection';
	import {afterUpdate} from 'svelte';

	afterUpdate(async () => {
		db.settings.where('user').equals(0).toArray().then(function(resp){
			if (!resp[0]){
				db.settings.put({
						theme: 'dark-theme',
						displayfid: 'yes',
						user: 0
					});
			} else {
				selected_theme = resp[0].theme;
			}
		})	
	})
	
	
</script>

<style>


	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
	}

	[aria-current] {
		position: relative;
		display: inline-block;
	}

	[aria-current]::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}
</style>

<nav class="mx-2">
	<ul class="px-4 py-3">
		<li><a aria-current="{segment === undefined ? 'page' : undefined}" href=".">home</a></li>
		<li><a aria-current="{segment === 'drive' ? 'page' : undefined}" href="drive/root">drive</a></li>
	</ul>
</nav>
