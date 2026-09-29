import fs from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import {
	blockNotDirectory,
	getRelativePath,
	normalizePath,
	resolvePath
} from '$lib/server/utils.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
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
		files.push({
			name: entry.name,
			type: entry.isDirectory() ? 'directory' : 'file',
			size: entry.isDirectory() ? null : entryStat.size,
			path: getRelativePath(target, entry.name),
			modified: entryStat.mtimeMs
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
