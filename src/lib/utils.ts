const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
export function isImage(n: string): boolean {
	const i = n.lastIndexOf('.');
	if (i <= 0) return false;
	return IMG_EXT.has(n.slice(i).toLowerCase());
}
