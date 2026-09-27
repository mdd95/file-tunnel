import fs from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import {
	blockNotDirectory,
	getRelativePath,
	isImage,
	normalizePath,
	resolvePath
} from '$lib/utils.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const target = await resolvePath(params.path);
	await blockNotDirectory(target);

	let entries;
	try {
		entries = await fs.readdir(target, { withFileTypes: true });
	} catch {
		error(400, `Error reading directory: ${target}`);
	}
	const files = [];

	for (const entry of entries) {
		const entryPath = path.join(target, entry.name);
		let entryStat;
		try {
			entryStat = await fs.stat(entryPath);
		} catch {
			continue;
		}

		const entryRelativePath = getRelativePath(target, entry.name);
		files.push({
			name: entry.name,
			type: entry.isDirectory() ? 'directory' : 'file',
			path: entryRelativePath,
			size: entry.isDirectory() ? null : entryStat.size,
			modified: entryStat.mtimeMs,
			isImage: entry.isFile() && isImage(entry.name),
			viewPath: `${url.origin}/view/${entryRelativePath}`,
			thumbnailPath:
				entry.isFile() && isImage(entry.name)
					? `${url.origin}/thumbnail/${entryRelativePath}`
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

	return {
		parentPath: normalizePath(params.path).split('/').slice(0, -1).join('/'),
		files
	};
};
