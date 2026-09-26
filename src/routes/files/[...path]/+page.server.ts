import fs from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import { getRelativePath, isImage, resolvePath } from '$lib/utils.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const absolutePath = await resolvePath(params.path);
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

		const entryPath = getRelativePath(absolutePath, entry.name);

		files.push({
			name: entry.name,
			type: entry.isDirectory() ? 'directory' : 'file',
			path: entryPath,
			size: entry.isDirectory() ? null : entryStat.size,
			modified: entryStat.mtimeMs,
			isImage: entry.isFile() && isImage(entry.name),
			viewPath: `${url.origin}/view/${entryPath}`,
			thumbnailPath:
				entry.isFile() && isImage(entry.name)
					? `${url.origin}/thumbnail/${entryPath}`
					: null
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
