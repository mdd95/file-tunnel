const SUPPORTED_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

export function isImage(fileName: string): boolean {
	const i = fileName.lastIndexOf('.');
	if (i <= 0) return false;
	return SUPPORTED_IMAGE_EXT.has(fileName.slice(i).toLowerCase());
}

const K = 1024;
const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export function formatSize(s: number) {
	if (s <= 0) return '0 B';
	const i = Math.floor(Math.log(s) / Math.log(K));
	const v = parseFloat((s / Math.pow(K, i)).toFixed(1));
	return `${v} ${UNITS[i]}`;
}

export function normalizePath(path: string): string {
	return path.replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+/g, '/');
}
