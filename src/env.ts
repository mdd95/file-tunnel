import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	ROOT: {
		private: true,
		static: true
	},
	THUMBNAIL_DIR: {
		private: true,
		static: true
	},
	PREVIEW_DIR: {
		private: true,
		static: true
	}
});
