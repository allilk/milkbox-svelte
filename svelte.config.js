import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */

const config = {
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		adapter: adapter(),
		target: '#svelte'
	}
};

export default config;
