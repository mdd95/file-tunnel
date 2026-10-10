import mime from 'mime-types';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import { error } from '@sveltejs/kit';
import { resolvePath } from '$lib/server/utils.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const reqPath = await resolvePath(params.path);

	let stat;
	try {
		stat = await fs.stat(reqPath);
	} catch {
		error(404, 'Not found');
	}

	if (!stat.isFile()) {
		error(400, 'Not a file');
	}

	setHeaders({
		'Content-Type': mime.lookup(reqPath) || 'application/octet-stream',
		'Content-Length': String(stat.size),
		'Cache-Control': 'private, max-age=3600'
	});

	const stream = createReadStream(reqPath);
	return new Response(Readable.toWeb(stream) as ReadableStream);
};
