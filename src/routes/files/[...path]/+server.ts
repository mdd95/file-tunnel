import mime from 'mime-types';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { error } from '@sveltejs/kit';
import { ROOT_DIR } from '$env/static/private';
import type { RequestHandler } from './$types';

function normalizePath(value = ''): string {
	return value.replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+/g, '/');
}

function isInsideRoot(root: string, target: string): boolean {
	return target === root || target.startsWith(root + path.sep);
}

async function safeRootPath(relativePath = ''): Promise<string | null> {
	try {
		const root = await fs.realpath(ROOT_DIR);
		const normalized = normalizePath(relativePath);
		const resolved = path.resolve(root, normalized);
		const realPath = await fs.realpath(resolved);
		if (!isInsideRoot(root, realPath)) return null;
		return realPath;
	} catch {
		return null;
	}
}

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const absolutePath = await safeRootPath(params.path);

	if (!absolutePath) {
		error(404, 'File not found');
	}

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
