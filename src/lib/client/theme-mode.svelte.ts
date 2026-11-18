function preload() {
	const mode = window.localStorage.getItem('theme-mode');
	document.documentElement.style.colorScheme =
		mode && new Set(['light', 'dark']).has(mode) ? mode : 'light dark';
}

export const preloadscript = `<script>(${preload.toString()})();</script>`;

let mode = $state('light');

export function getmode() {
	return mode;
}

export function setmode(m: string) {
	mode = m;
	document.documentElement.style.colorScheme = m;
	window.localStorage.setItem('theme-mode', m);
}

export function togglemode() {
	setmode(mode === 'dark' ? 'light' : 'dark');
}
