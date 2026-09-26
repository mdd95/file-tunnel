import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT_DIR, THUMBNAIL_DIR } from '$env/static/private';

export function normalizePath(value = ''): string {
	return value.replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+/g, '/');
}

export function isInsideRoot(root: string, target: string): boolean {
	return target === root || target.startsWith(root + path.sep);
}

export async function safeRootPath(relativePath = ''): Promise<string | null> {
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

export function getRelativePath(directory: string, fileName: string): string {
	const relative = path.relative(ROOT_DIR, path.join(directory, fileName));
	return relative.split(path.sep).join('/');
}

const IMAGE_EXT = new Set([
	'.jpg',
	'.jpeg',
	'.png',
	'.webp',
	'.avif',
	'.gif',
	'.bmp',
	'.tif',
	'.tiff'
]);

export function isImage(fileName: string): boolean {
	return IMAGE_EXT.has(path.extname(fileName).toLowerCase());
}

export function getThumbnailPath(relativePath: string): string {
	const hash = crypto.createHash('sha256').update(relativePath).digest('hex');
	return path.join(THUMBNAIL_DIR, `${hash}.jpg`);
}
