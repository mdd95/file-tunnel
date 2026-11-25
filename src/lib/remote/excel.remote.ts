import path from 'node:path';

import { query } from '$app/server';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';
import xlsx from 'xlsx';

import { resolvePath } from '#lib/server/utils.js';

const SUPPORTS = new Set(['.xls', '.xlsb', '.xlsm', '.xlsx']);

export const read = query(
	v.object({
		path: v.string(),
		sheet: v.number()
	}),
	async (argv) => {
		const filePath = await resolvePath(argv.path);

		if (!SUPPORTS.has(path.extname(filePath))) error(400, 'Not supported');

		const workbook = xlsx.readFile(filePath, { cellDates: true });

		if (!workbook.SheetNames.length) error(400, 'No sheet found');

		const sheetName = workbook.SheetNames[argv.sheet];
		const sheet = workbook.Sheets[sheetName];

		const data = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
			defval: '',
			raw: true
		});

		return {
			sheetNames: workbook.SheetNames,
			rows: data
		};
	}
);
