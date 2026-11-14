import mime from 'mime-types';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import sharp from 'sharp';
import { error } from '@sveltejs/kit';
import { thumbnailPath, resolvePath } from '#lib/server/utils.js';
import { isImage } from '#lib/client/utils.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const reqPath = await resolvePath(params.path);

	let reqStat;
	try {
		reqStat = await fs.stat(reqPath);
	} catch {
		error(404, 'Not found');
	}

	if (!reqStat.isFile()) {
		error(404, 'Not a file');
	}

	if (!isImage(reqPath)) {
		error(400, 'Not an image file');
	}

	const previewPath = thumbnailPath(params.path, 'webp');

	let previewStat;
	try {
		previewStat = await fs.stat(previewPath);
	} catch {
		await createPreview(reqPath, previewPath);
		previewStat = await fs.stat(previewPath);
	}

	if (previewStat.mtimeMs < reqStat.mtimeMs) {
		await createPreview(reqPath, previewPath);
	}

	setHeaders({
		'Content-Type': mime.lookup(reqPath) || 'application/octet-stream',
		'Content-Length': String(previewStat.size),
		'Cache-Control': 'private, max-age=3600'
	});

	const stream = createReadStream(previewPath);
	return new Response(Readable.toWeb(stream) as ReadableStream);
};

async function createPreview(requestPath: string, outputPath: string) {
	await sharp(requestPath)
		.rotate()
		.resize({
			withoutEnlargement: true
		})
		.webp({
			quality: 75
		})
		.toFile(outputPath);
}
