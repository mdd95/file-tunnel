import fs from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import { safeRootPath } from '$lib/utils.js';
import type { PageServerLoad } from './$types';

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
			modified: entryStat.mtimeMs
		});
	}

	return { files };
};
