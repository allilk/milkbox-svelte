import sirv from 'sirv';
const express = require('express');
import compression from 'compression';
import * as sapper from '@sapper/server';
const crypto = require('crypto');

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';
const nonce = crypto.randomBytes(16).toString('hex');

express()
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware()
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
	
import helmet from 'helmet';

express().use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: 'self',
			// Has to be unsafe-eval because %sapper.scripts% uses eval
			// @ts-expect-error
			scriptSrc: ["'self' 'unsafe-eval' 'apis.google.com'", (_req, res) => `'nonce-${nonce}'`],
			// Has to be unsafe-inline currently, because svelte-awesome & svelte-image sets inline style
			styleSrc: ["'self' 'unsafe-inline'"],
			// data: needed for svelte-image placeholders and svelte-awesome icons
			imgSrc: ["'self'", 'data:']
		}
	},
	referrerPolicy: { policy: 'same-origin' },

}));
express().listen(8888, '0.0.0.0');
express().use(sapper.middleware());