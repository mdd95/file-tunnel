<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	$effect(() => {
		console.log(data);
	});
</script>

{#each data.files as file (file.name)}
	{#if file.type === 'directory'}
		<div class="item">
			<span>📁</span>
			<a href={resolve('/files/[...path]', { path: file.path })}>{file.name}</a>
		</div>
	{:else if file.type === 'file'}
		<div class="item">
			<div>
				{#if file.isImage}
					<img src={file.thumbnailPath} alt="Thumbnail for {file.name}" loading="lazy" />
				{/if}
			</div>
			<a href={resolve('/view/[...path]', { path: file.path })}>{file.name}</a>
		</div>
	{/if}
{/each}

<style>
	.item {
		display: flex;
		align-items: center;
	}

	img {
		width: 3rem;
		aspect-ratio: 1 / 1;
	}
</style>
