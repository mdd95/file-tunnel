import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import { ROOT_DIR, THUMBNAIL_DIR } from '$env/static/private';
import type { Stats } from 'node:fs';

export function normalizePath(value = ''): string {
	return value.replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+/g, '/');
}

export async function resolvePath(relativePath = ''): Promise<string> {
	try {
		const root = await fs.realpath(ROOT_DIR);
		const target = await fs.realpath(path.resolve(root, normalizePath(relativePath)));
		if (!(target === root || target.startsWith(root + path.sep))) {
			error(404, 'Not found');
		}
		return target;
	} catch {
		error(404, 'Not found');
	}
}

export async function blockNotDirectory(dirPath: string): Promise<Stats> {
	try {
		const stat = await fs.stat(dirPath);
		if (!stat.isDirectory()) {
			error(400, 'Not a directory');
		}
		return stat;
	} catch {
		error(404, 'Not found');
	}
}

export function getRelativePath(directory: string, fileName: string): string {
	const relative = path.relative(ROOT_DIR, path.join(directory, fileName));
	return relative.split(path.sep).join('/');
}

export function getThumbnailPath(relativePath: string): string {
	const hash = crypto.createHash('sha256').update(relativePath).digest('hex');
	return path.join(THUMBNAIL_DIR, `${hash}.jpg`);
}
