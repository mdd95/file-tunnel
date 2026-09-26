import mime from 'mime-types';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import { error } from '@sveltejs/kit';
import { resolvePath } from '$lib/utils.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const absolutePath = await resolvePath(params.path);
	try {
		const stat = await fs.stat(absolutePath);

		if (!stat.isFile()) {
			error(404, 'File not found');
		}

		setHeaders({
			'Content-Type': mime.lookup(absolutePath) || 'application/octet-stream',
			'Content-Length': String(stat.size),
			'Cache-Control': 'private, max-age=3600'
		});

		const stream = createReadStream(absolutePath);
		return new Response(Readable.toWeb(stream) as ReadableStream);
	} catch (err) {
		console.error('File error: ', err);
		error(404, 'File not found');
	}
};
