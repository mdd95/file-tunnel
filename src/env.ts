import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	COMPRESSED_DIR: { static: true },
	THUMBNAIL_DIR: { static: true },
	ROOT_DIR: { static: true }
});
