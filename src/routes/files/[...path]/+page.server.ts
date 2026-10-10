import fs from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import { getRelativePath, resolvePath } from '$lib/server/utils.js';
import { normalizeUrl } from '$lib/utils.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const target = await resolvePath(params.path);
	let stat;
	try {
		stat = await fs.stat(target);
	} catch {
		error(404, 'Not found');
	}
	if (!stat.isDirectory()) {
		error(400, 'Not a directory');
	}

	let entries;
	try {
		entries = await fs.readdir(target, { withFileTypes: true });
	} catch {
		error(400, 'Error reading directory');
	}
	const files = [];

	for (const entry of entries) {
		const entryPath = path.join(target, entry.name);
		try {
			stat = await fs.stat(entryPath);
		} catch {
			continue;
		}
		files.push({
			name: entry.name,
			type: entry.isDirectory() ? 'directory' : 'file',
			size: entry.isDirectory() ? null : stat.size,
			path: getRelativePath(target, entry.name),
			modified: stat.mtimeMs
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
		parentPath: normalizeUrl(params.path).split('/').slice(0, -1).join('/'),
		files
	};
};
