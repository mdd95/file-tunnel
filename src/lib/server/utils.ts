import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import { normalizeUrl } from '$lib/utils.js';
import { ROOT_DIR, THUMBNAIL_DIR } from '$env/static/private';

export async function resolvePath(reqPath: string): Promise<string> {
	let root, target;
	try {
		root = await fs.realpath(ROOT_DIR);
		target = await fs.realpath(path.resolve(root, normalizeUrl(reqPath)));
	} catch {
		error(404, 'Failed to resolve requested path');
	}
	if (!(target === root || target.startsWith(root + path.sep))) {
		error(404, 'Request path is outside of root directory');
	}
	return target;
}

export function getRelativePath(directory: string, fileName: string): string {
	const relative = path.relative(ROOT_DIR, path.join(directory, fileName));
	return relative.split(path.sep).map(encodeURIComponent).join('/');
}

export function getPreviewPath(reqPath: string, format: string): string {
	const hash = crypto.createHash('sha256').update(reqPath).digest('hex');
	return path.join(THUMBNAIL_DIR, `${hash}.${format}`);
}
