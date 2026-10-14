<script lang="ts">
	import FileIcon from '@iconify-svelte/flat-color-icons/file';
	import FolderIcon from '@iconify-svelte/flat-color-icons/folder';
	import GridIcon from '@lucide/svelte/icons/grid-2x2';
	import ListIcon from '@lucide/svelte/icons/list';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import FolderUpIcon from '@lucide/svelte/icons/folder-up';
	import { resolve } from '$app/paths';
	import { isImage } from '$lib/utils.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	$effect(() => {
		console.log(data);
	});
</script>

<svelte:head>
	<title>{data.name}</title>
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

<main>
	{#each data.files as file (file.name)}
		{#if file.type === 'directory'}
			<a href={resolve('/files/[...path]', { path: file.path })} class="file">
				<FolderIcon height="2em" />
				<span>{file.name}</span>
			</a>
		{:else if isImage(file.name)}
			<a href={resolve('/view/[...path]', { path: file.path })} class="file">
				<img src="/thumbnail/{file.path}" alt={file.name} loading="lazy" />
				<span>{file.name}</span>
			</a>
		{:else if file.type === 'file'}
			<a href={resolve('/view/[...path]', { path: file.path })} class="file">
				<div>
					<FileIcon height="2em" />
				</div>
				<span>{file.name}</span>
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

	.file {
		height: 3.5rem;
		padding: 0 2rem;
		display: grid;
		grid-template-columns: 2.5rem 1fr;
		align-items: center;
		gap: 1rem;

		@media (hover: hover) {
			&:hover {
				background-color: rgb(0 0 0 / 0.1);
			}
		}

		& span {
			width: 100%;
			overflow: hidden;
			text-wrap: nowrap;
			text-overflow: ellipsis;
		}
	}

	img {
		aspect-ratio: 1 / 1;
	}
</style>
