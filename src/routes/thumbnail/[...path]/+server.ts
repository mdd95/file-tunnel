import mime from 'mime-types';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import sharp from 'sharp';
import { error } from '@sveltejs/kit';
import { THUMBNAIL_DIR } from '$env/static/private';
import { getThumbnailPath, isImage, safeRootPath } from '$lib/utils.js';
import type { RequestHandler } from './$types';

const THUMBNAIL_SIZE = 400;
const THUMBNAIL_QUALITY = 78;

fs.mkdir(THUMBNAIL_DIR, { recursive: true });

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const origPath = await safeRootPath(params.path);
	if (!origPath) error(404, 'File not found');

	const origStat = await fs.stat(origPath);
	if (!origStat.isFile()) error(404, 'File not found');
	if (!isImage(origPath)) error(400, 'Not an image');

	const thumbnailPath = getThumbnailPath(params.path);

	try {
		const thumbnailStat = await fs.stat(thumbnailPath);

		if (thumbnailStat.mtimeMs >= origStat.mtimeMs) {
			void 0;
		}

		const stream = createReadStream(thumbnailPath);

		setHeaders({
			'Content-Type': mime.lookup(origPath) || 'application/octet-stream',
			'Content-Length': String(thumbnailStat.size),
			'Cache-Control': 'private, max-age=3600'
		});

		return new Response(Readable.toWeb(stream) as ReadableStream);
	} catch {
		await sharp(origPath)
			.rotate()
			.resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
				fit: 'cover',
				position: 'centre',
				withoutEnlargement: true
			})
			.jpeg({ quality: THUMBNAIL_QUALITY, mozjpeg: true })
			.toFile(thumbnailPath);

		const thumbnailStat = await fs.stat(thumbnailPath);
		const stream = createReadStream(thumbnailPath);

		setHeaders({
			'Content-Type': mime.lookup(origPath) || 'application/octet-stream',
			'Content-Length': String(thumbnailStat.size),
			'Cache-Control': 'private, max-age=3600'
		});

		return new Response(Readable.toWeb(stream) as ReadableStream);
	}
};
