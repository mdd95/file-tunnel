<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import Image from '@lucide/svelte/icons/image';
	import X from '@lucide/svelte/icons/x';

	import { resolve } from '$app/paths';
	import { formatSize, isImage } from '#lib/client/utils.js';

	type Props = {
		files: {
			name: string;
			type: string;
			size: number | null;
			path: string;
			modified: number;
		}[];
		i: number;
	};

	let { files, i }: Props = $props();
	const cid = $props.id();

	let current = $derived(i);

	let imgs = $derived(
		files.reduce<number[]>((a, file, j) => {
			if (isImage(file.name)) a.push(j);
			return a;
		}, [])
	);

	function nav(d: 1 | -1) {
		if (!imgs.length) return;
		const pos = imgs.indexOf(current);
		const nxt = (pos + d + imgs.length) % imgs.length;
		current = imgs[nxt];
	}

	let tsx = 0;
	let tex = 0;
	const MAXDIST = 50;

	function handleSwipe() {
		const dist = tex - tsx;
		if (Math.abs(dist) < MAXDIST) return;
		nav(dist > 0 ? 1 : -1);
	}
</script>

<button command="show-modal" commandfor="dialog-{cid}" class="btn btn-file">
	<img
		src={resolve('/media/[action]/[...path]', {
			action: 'thumbnail',
			path: files[i].path
		})}
		alt={files[i].name}
		loading="lazy"
	/>
	<span>{files[i].name}</span>
	<span class="file-size">{formatSize(files[i].size ?? 0)}</span>
</button>

<dialog
	id="dialog-{cid}"
	closedby="any"
	class="dialog"
	onkeydown={(e) => {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			nav(1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			nav(-1);
		}
	}}
>
	<div class="wrapper">
		<div class="header">
			<span>{files[current].name}</span>
			<button
				command="request-close"
				commandfor="dialog-{cid}"
				class="btn btn-icon btn-secondary"
			>
				<X />
			</button>
		</div>

		<div
			role="button"
			tabindex="0"
			ontouchstart={(e) => (tsx = e.changedTouches[0].screenX)}
			ontouchend={(e) => {
				tex = e.changedTouches[0].screenX;
				handleSwipe();
			}}
			class="content"
		>
			<img
				src={resolve('/media/[action]/[...path]', {
					action: 'preview',
					path: files[current].path
				})}
				alt="Preview"
				loading="lazy"
			/>
		</div>

		<div class="actions">
			<a
				href={resolve('/media/[action]/[...path]', {
					action: 'raw',
					path: files[current].path
				})}
				class="btn btn-secondary"
			>
				<Image />
				View Original
			</a>
			<a
				href={resolve('/media/[action]/[...path]', {
					action: 'download',
					path: files[current].path
				})}
				target="_blank"
				class="btn btn-secondary"
			>
				<Download />
				Download
			</a>
		</div>
	</div>
</dialog>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
	}

	.header {
		padding: 1rem;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;

		& span {
			font-weight: bolder;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}
	}

	.content {
		display: flex;
		justify-content: center;
	}

	.actions {
		padding: 0.5rem;
		display: flex;
		justify-content: end;
		gap: 0.25rem;
	}
</style>
