import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT_DIR } from '$env/static/private';

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
