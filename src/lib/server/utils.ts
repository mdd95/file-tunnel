import { error } from '@sveltejs/kit';
import { ROOT, THUMBNAIL_DIR } from '$app/env/private';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { normalizePath } from '../client/utils.ts';

export async function resolvePath(requestPath: string): Promise<string> {
	let root, target;

	try {
		root = await fs.realpath(ROOT);
		target = await fs.realpath(path.resolve(root, requestPath));
	} catch {
		error(404, 'File not found');
	}

	if (!(target === root || target.startsWith(root + path.sep))) {
		error(403, 'File is outside of root directory');
	}

	return target;
}

export function relativeUrl(directory: string, fileName: string) {
	return normalizePath(path.relative(ROOT, path.join(directory, fileName)));
}

export function thumbnailPath(requestPath: string, format: string): string {
	const hash = crypto.createHash('sha256').update(requestPath).digest('hex');
	return path.join(THUMBNAIL_DIR, `${hash}.${format}`);
}
