function loadThemeMode(KEY: string) {
	const root = document.documentElement;
	const mode = window.localStorage.getItem(KEY);

	switch (mode) {
		case 'light':
			root.style.colorScheme = 'light';
			break;
		case 'dark':
			root.style.colorScheme = 'dark';
			break;
		default:
			root.style.colorScheme = 'light dark';
			break;
	}
}

const MODE_KEY = 'theme-mode';
export const modeFnStr = `<script>(${loadThemeMode.toString()})("${MODE_KEY}");</script>`;
