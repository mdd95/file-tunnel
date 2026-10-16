import fs from 'node:fs/promises';
import { THUMBNAIL_DIR, COMPRESSED_DIR } from '$app/env/private';
import type { ServerInit } from '@sveltejs/kit/hooks';

export const init: ServerInit = async () => {
	await Promise.all([
		fs.mkdir(THUMBNAIL_DIR, { recursive: true }),
		fs.mkdir(COMPRESSED_DIR, { recursive: true })
	]);
};
