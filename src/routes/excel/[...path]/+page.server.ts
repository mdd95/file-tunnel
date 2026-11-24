import { error } from '@sveltejs/kit';
import xlsx from 'xlsx';

import path from 'node:path';

import { resolvePath } from '#lib/server/utils.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const filePath = await resolvePath(params.path);
	const fileExt = path.extname(filePath);

	if (fileExt !== '.xlsx') error(403, 'File not excel');

	const workbook = xlsx.readFile(filePath, { cellDates: true });
	if (!workbook.SheetNames.length) error(404);

	const sheetName = workbook.SheetNames[0];
	const sheet = workbook.Sheets[sheetName];
	const data = xlsx.utils.sheet_to_json<{ id: string }>(sheet, { defval: '', raw: true });

	return {
		rows: data
	};
};
