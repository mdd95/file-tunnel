import mime from 'mime-types';
import sharp from 'sharp';
import crypto from 'node:crypto';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import { error } from '@sveltejs/kit';
import { resolvePath } from '$lib/server/utils.js';
import { COMPRESSED_DIR } from '$env/static/private';
import type { RequestHandler } from './$types';

fs.mkdir(COMPRESSED_DIR, { recursive: true });

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

	const compressedPath = getCompressedPath(params.path, 'avif');

	let compressedStat;
	try {
		compressedStat = await fs.stat(compressedPath);
	} catch {
		await createCompressed(reqPath, compressedPath);
		compressedStat = await fs.stat(compressedPath);
	}

	if (compressedStat.mtimeMs < stat.mtimeMs) {
		await createCompressed(reqPath, compressedPath);
	}

	setHeaders({
		'Content-Type': mime.lookup(reqPath) || 'application/octet-stream',
		'Content-Length': String(compressedStat.size),
		'Cache-Control': 'private, max-age=3600'
	});

	const stream = createReadStream(compressedPath);
	return new Response(Readable.toWeb(stream) as ReadableStream);
};

function getCompressedPath(reqPath: string, format: string) {
	const hash = crypto.createHash('sha256').update(reqPath).digest('hex');
	return path.join(COMPRESSED_DIR, `${hash}.${format}`);
}

async function createCompressed(reqPath: string, compressedPath: string) {
	await sharp(reqPath)
		.rotate()
		.avif({
			quality: 80,
			effort: 5,
			chromaSubsampling: '4:4:4'
		})
		.toFile(compressedPath);
}
