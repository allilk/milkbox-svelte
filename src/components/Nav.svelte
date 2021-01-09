<script>
	export let segment;
	// let userLoggedIn = false;
	// window.onLoadbrowser = () => {
	//   userLoggedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
	//   if (userLoggedIn) {  
	// 	// Handle login
	//   }
	// }
</script>

<style>
	nav {
		border-bottom: 1px solid rgba(255,62,0,0.1);
		font-weight: 300;
		padding: 0 1em;
	}

	ul {
		margin: 0;
		padding: 0;
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
		background-color: rgb(255,62,0);
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
	<ul>
		<li><a aria-current="{segment === undefined ? 'page' : undefined}" href=".">home</a></li>
		<li><a rel=prefetch aria-current="{segment === 'browser' ? 'page' : undefined}" href="browser">browser</a></li>
		<li><a rel=prefetch aria-current="{segment === 'shared-drives' ? 'page' : undefined}" href="browser/shared-drives">shared drives</a></li>
		<li><a aria-current="{segment === 'settings' ? 'page' : undefined}" href="settings">settings</a></li>
		<!-- for the blog link, we're using rel=prefetch so that Sapper prefetches
		     the blog data when we hover over the link or tap it on a touchscreen -->
	</ul>
</nav>
