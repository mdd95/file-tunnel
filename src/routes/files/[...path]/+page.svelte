<script lang="ts">
	import { resolve } from '$app/paths';
	import FileIcon from '@iconify-svelte/flat-color-icons/file';
	import FolderIcon from '@iconify-svelte/flat-color-icons/folder';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import Download from '@lucide/svelte/icons/download';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import FolderUpIcon from '@lucide/svelte/icons/folder-up';
	import X from '@lucide/svelte/icons/x';
	import { Moon, Sun } from 'lucide';
	import { MorphIcon } from 'morphicons/svelte';

	import { getmode, togglemode } from '#lib/client/theme-mode.svelte.js';
	import { formatSize, isExcel, isImage } from '#lib/client/utils.js';

	import type { PageProps } from './$types';
	import PreviewDialog from './preview-dialog.svelte';

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
		<button onclick={() => togglemode()} class="btn btn-icon" aria-label="Toggle theme mode">
			<MorphIcon icon={getmode() === 'dark' ? Moon : Sun} />
		</button>
	</div>
</div>

<div class="breadcrumb">
	<ol>
		{#each bclinks as { label, url }}
			<li><a href={resolve('/files/[...path]', { path: url })}>{label}</a></li>
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
		{:else if isExcel(file.name)}
			<button command="show-modal" commandfor="dialog-{i}" class="btn btn-file">
				<FileIcon height="2em" />
				<span>{file.name}</span>
				<span class="file-size">{formatSize(file.size ?? 0)}</span>
			</button>

			<dialog id="dialog-{i}" closedby="any" class="dialog">
				<div class="wrapper">
					<div class="header">
						<span>{file.name}</span>
						<button
							command="request-close"
							commandfor="dialog-{i}"
							class="btn btn-icon btn-secondary"
						>
							<X />
						</button>
					</div>

					<div class="actions">
						<a
							href={resolve('/excel/[...path]', { path: file.path })}
							class="btn btn-secondary"
						>
							<FileSpreadsheet />
							View Excel
						</a>
						<a
							href={resolve('/media/[action]/[...path]', {
								action: 'download',
								path: file.path
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
	{:else}
		<div class="empty">Empty folder</div>
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
		background-color: var(--color-base);
		border-bottom: 1px solid var(--color-border);

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

	.empty {
		height: 10rem;
		display: grid;
		place-items: center;
		color: var(--color-muted-text);
	}

	.dialog {
		& .header {
			height: 4rem;
			padding: 0 1rem;
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

		& .actions {
			padding: 1rem;
			display: flex;
			justify-content: end;
			gap: 0.25rem;
		}
	}
</style>
