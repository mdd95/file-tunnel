import fs from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import { getRelativePath, safeRootPath } from '$lib/utils.js';
import type { PageServerLoad } from './$types';

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

function isImage(fileName: string): boolean {
	return IMAGE_EXT.has(path.extname(fileName).toLowerCase());
}

export const load: PageServerLoad = async ({ params }) => {
	const absolutePath = await safeRootPath(params.path);

	if (!absolutePath) {
		error(404, 'File not found');
	}

	const stat = await fs.stat(absolutePath);
	if (!stat.isDirectory()) {
		error(400, 'Not a directory');
	}

	const entries = await fs.readdir(absolutePath, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const entryAbsolutePath = path.join(absolutePath, entry.name);
		let entryStat;

		try {
			entryStat = await fs.stat(entryAbsolutePath);
		} catch {
			continue;
		}

		files.push({
			name: entry.name,
			type: entry.isDirectory() ? 'directory' : 'file',
			path: getRelativePath(absolutePath, entry.name),
			size: entry.isDirectory() ? null : entryStat.size,
			modified: entryStat.mtimeMs,
			isImage: entry.isFile() && isImage(entry.name)
		});
	}

	files.sort((a, b) => {
		if (a.type !== b.type) {
			return a.type === 'directory' ? -1 : 1;
		}
		return a.name.localeCompare(b.name, undefined, {
			numeric: true,
			sensitivity: 'base'
		});
	});

	return { files };
};
