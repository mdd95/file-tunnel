import mime from 'mime-types';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import sharp from 'sharp';
import { error } from '@sveltejs/kit';
import { THUMBNAIL_DIR } from '$env/static/private';
import { getPreviewPath, normalizePath, resolvePath } from '$lib/server/utils.js';
import { isImage } from '$lib/utils.js';
import type { RequestHandler } from './$types';

fs.mkdir(THUMBNAIL_DIR, { recursive: true });

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const reqPath = await resolvePath(params.path);

	let reqStat;
	try {
		reqStat = await fs.stat(reqPath);
	} catch {
		error(404, `File not found: "${normalizePath(params.path)}"`);
	}

	if (!reqStat.isFile()) {
		error(404, `File not found: "${normalizePath(params.path)}"`);
	}

	if (!isImage(reqPath)) {
		error(400, `Invalid file type: "${normalizePath(params.path)}"`);
	}

	const previewPath = getPreviewPath(params.path, 'avif');

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

async function createPreview(reqPath: string, previewPath: string) {
	await sharp(reqPath)
		.rotate()
		.resize(256, 256, {
			fit: 'cover',
			position: 'centre',
			withoutEnlargement: true
		})
		.toFormat('avif', { quality: 48 })
		.toFile(previewPath);
}
