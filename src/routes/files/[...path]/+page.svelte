<script lang="ts">
	import FileIcon from '@iconify-svelte/flat-color-icons/file';
	import FolderIcon from '@iconify-svelte/flat-color-icons/folder';

	import GridIcon from '@lucide/svelte/icons/grid-2x2';
	import ListIcon from '@lucide/svelte/icons/list';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import FolderUpIcon from '@lucide/svelte/icons/folder-up';

	import { resolve } from '$app/paths';

	import { formatSize, isImage } from '#lib/client/utils.js';

	import PreviewDialog from './preview-dialog.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// const conv = (str: string) =>
	// 	str.replace(/(^|-)([a-z])/g, (...a) => ` ${a[2].toUpperCase()}`).trim();

	let bclinks = $derived.by(() => {
		const arr = [{ label: 'ROOT', url: '' }];
		let url = '';

		for (const s of data.url.split('/')) {
			if (!s) continue;

			url += url ? `/${s}` : s;
			arr.push({ label: s, url });
		}
		return arr;
	});
</script>

<svelte:head>
	<title>{data.name || 'Files'}</title>
</svelte:head>

<div class="toolbar">
	<div>
		<button class="btn btn-icon" onclick={() => window.history.back()}>
			<ArrowLeftIcon size={20} />
		</button>
		<button class="btn btn-icon" onclick={() => window.history.forward()}>
			<ArrowRightIcon size={20} />
		</button>
		<a href={resolve('/files/[...path]', { path: data.parentUrl })} class="btn btn-icon">
			<FolderUpIcon size={20} />
		</a>
	</div>
	<div>
		<button class="btn btn-icon">
			<GridIcon size={20} />
		</button>
		<button class="btn btn-icon">
			<ListIcon size={20} />
		</button>
	</div>
</div>

<div class="breadcrumb">
	<ol>
		{#each bclinks as { label, url }}
			<li><a href="/files/{url}">{label}</a></li>
		{/each}
	</ol>
</div>

<main>
	{#each data.files as file, i (file.name)}
		{#if file.type === 'directory'}
			<a href={resolve('/files/[...path]', { path: file.path })} class="btn btn-file">
				<FolderIcon height="2em" />
				<span>{file.name}</span>
			</a>
		{:else if isImage(file.name)}
			<PreviewDialog files={data.files} {i} />
		{:else}
			<a
				href={resolve('/media/[action]/[...path]', {
					action: 'download',
					path: file.path
				})}
				target="_blank"
				class="btn btn-file"
			>
				<FileIcon height="2em" />
				<span>{file.name}</span>
				<span class="file-size">{formatSize(file.size ?? 0)}</span>
			</a>
		{/if}
	{/each}
</main>

<style>
	.toolbar {
		position: sticky;
		top: 0;
		height: 4rem;
		padding: 0 1rem;
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid rgb(0 0 0 / 0.2);
		background-color: #fff;

		& > * {
			display: flex;
			align-items: center;
		}
	}

	main {
		display: flex;
		flex-direction: column;
	}

	.breadcrumb {
		padding: 1rem;
	}

	.breadcrumb ol {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		list-style: none;

		& li:has(+ li):after {
			content: '/';
			margin-left: 0.5rem;
		}
	}
</style>
