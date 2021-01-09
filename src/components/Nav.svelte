<script>
	export let segment;
</script>

<style>
	nav {
		margin-bottom: 3px;
		font-weight: 300;
		padding: 0 1em;
	}

	ul {
		margin: 0;
	}

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
		background-color: #4ecca3;
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}
</style>

<nav>
	<ul class="px-4 py-3">
		<li><a aria-current="{segment === undefined ? 'page' : undefined}" href=".">home</a></li>
		<li><a rel=prefetch aria-current="{segment === 'browser' ? 'page' : undefined}" href="browser">browser</a></li>
		<li><a rel=prefetch aria-current="{segment === 'shared-drives' ? 'page' : undefined}" href="browser/shared-drives">shared drives</a></li>
		<li><a aria-current="{segment === 'settings' ? 'page' : undefined}" href="settings">settings</a></li>
	</ul>
</nav>
