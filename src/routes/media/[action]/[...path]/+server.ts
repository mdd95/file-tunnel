import { error } from '@sveltejs/kit';
import mime from 'mime-types';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import path from 'path';
import sharp from 'sharp';
import { isImage } from '#lib/client/utils.js';
import { resolvePath, thumbnailPath } from '#lib/server/utils.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const requestPath = await resolvePath(params.path);
	const stat = await fs.stat(requestPath);

	if (!stat.isFile()) error(404, 'File not found');

	const filename = path.basename(requestPath);

	switch (params.action) {
		case 'download': {
			setHeaders({
				'Content-Type': 'application/octet-stream',
				'Content-Length': String(stat.size),
				'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
				'Cache-Control': 'private, no-cache'
			});

			return streamFile(requestPath);
		}

		case 'raw': {
			if (!isImage(requestPath)) error(400, 'Not an image file');

			setHeaders({
				'Content-Type': mime.lookup(filename) || 'application/octet-stream',
				'Content-Length': String(stat.size),
				'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
				'Cache-Control': 'private, max-age=3600'
			});

			return streamFile(requestPath);
		}

		case 'preview': {
			if (!isImage(requestPath)) error(400, 'Not an image file');

			setHeaders({
				'Content-Type': mime.lookup(filename) || 'application/octet-stream',
				'Content-Length': String(stat.size),
				'Content-Disposition': 'inline',
				'Cache-Control': 'private, max-age=3600'
			});

			return streamFile(requestPath);
		}
		case 'thumbnail': {
			if (!isImage(requestPath)) error(400, 'Not an image file');

			const thumbnail = thumbnailPath(requestPath, 'webp');
			await createThumbnail(requestPath, thumbnail);

			setHeaders({
				'Content-Type': 'image/webp',
				'Content-Length': '',
				'Cache-Control': 'private, max-age=3600'
			});
			return streamFile(thumbnail);
		}
		default:
			error(400, 'Invalid action');
	}
};

async function createThumbnail(requestPath: string, outputPath: string) {
	try {
		await fs.access(outputPath);
	} catch {
		await sharp(requestPath)
			.rotate()
			.resize({
				width: 400,
				height: 400,
				fit: 'inside',
				withoutEnlargement: true
			})
			.webp({
				quality: 75,
				effort: 4
			})
			.toFile(outputPath);
	}
}

function streamFile(filePath: string) {
	const stream = createReadStream(filePath);
	return new Response(Readable.toWeb(stream) as ReadableStream, {
		headers: { 'X-Content-Type-Options': 'nosniff' }
	});
}
