const SUPPORTED_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

export function isImage(fileName: string): boolean {
	const i = fileName.lastIndexOf('.');
	if (i <= 0) return false;
	return SUPPORTED_IMAGE_EXT.has(fileName.slice(i).toLowerCase());
}

export function normalizePath(path: string): string {
	return path.replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+/g, '/');
}
