import crypto from 'node:crypto';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import path from 'path';

import { PREVIEW_DIR, THUMBNAIL_DIR } from '$app/env/private';
import { error } from '@sveltejs/kit';
import mime from 'mime-types';
import sharp from 'sharp';

import { isImage } from '#lib/client/utils.js';
import { resolvePath } from '#lib/server/utils.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const rpath = await resolvePath(params.path);
	const stat = await fs.stat(rpath);

	if (!stat.isFile()) error(404, 'File not found');

	const filename = path.basename(rpath);
	const mimetype = mime.lookup(filename) || 'application/octet-stream';

	switch (params.action) {
		case 'download': {
			setHeaders({
				'Content-Type': 'application/octet-stream',
				'Content-Length': `${stat.size}`,
				'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
				'Cache-Control': 'private, no-cache'
			});

			return streamFile(rpath);
		}

		case 'raw': {
			if (!isImage(rpath)) error(400, 'Not an image file');

			setHeaders({
				'Content-Type': mimetype,
				'Content-Length': `${stat.size}`,
				'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
				'Cache-Control': 'private, max-age=3600'
			});

			return streamFile(rpath);
		}

		case 'preview': {
			if (!isImage(rpath)) error(400, 'Not an image file');

			const ppath = tmppath(PREVIEW_DIR, rpath);
			await createPreview(rpath, ppath);

			let pstat = await fs.stat(ppath);
			if (pstat.mtimeMs < stat.mtimeMs) {
				await createPreview(rpath, ppath);
				pstat = await fs.stat(ppath);
			}

			setHeaders({
				'Content-Type': 'image/webp',
				'Content-Length': `${pstat.size}`,
				'Content-Disposition': 'inline',
				'Cache-Control': 'private, max-age=3600'
			});

			return streamFile(ppath);
		}
		case 'thumbnail': {
			if (!isImage(rpath)) error(400, 'Not an image file');

			const tpath = tmppath(THUMBNAIL_DIR, rpath);
			await createThumbnail(rpath, tpath);

			let tstat = await fs.stat(tpath);
			if (tstat.mtimeMs < stat.mtimeMs) {
				await createThumbnail(rpath, tpath);
				tstat = await fs.stat(tpath);
			}

			setHeaders({
				'Content-Type': 'image/webp',
				'Content-Length': `${tstat.size}`,
				'Content-Disposition': 'inline',
				'Cache-Control': 'private, max-age=3600'
			});

			return streamFile(tpath);
		}
		default:
			error(400, 'Invalid action');
	}
};

function tmppath(bpath: string, rpath: string) {
	const hash = crypto.createHash('sha256').update(rpath).digest('hex');
	return path.join(bpath, `${hash}.webp`);
}

async function createPreview(src: string, out: string) {
	try {
		await fs.access(out);
	} catch {
		await sharp(src)
			.rotate()
			.resize({ width: 1920, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 80, effort: 4 })
			.toFile(out);
	}
}

async function createThumbnail(src: string, out: string) {
	try {
		await fs.access(out);
	} catch {
		await sharp(src)
			.rotate()
			.resize({ width: 400, height: 400, fit: 'cover', withoutEnlargement: true })
			.webp({ quality: 75, effort: 4 })
			.toFile(out);
	}
}

function streamFile(filePath: string) {
	const stream = createReadStream(filePath);
	return new Response(Readable.toWeb(stream) as ReadableStream, {
		headers: { 'X-Content-Type-Options': 'nosniff' }
	});
}
