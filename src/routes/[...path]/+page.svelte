<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#each data.files as file (file.name)}
	{#if file.type === 'directory'}
		<div class="item">
			<span>📁</span>
			<a href={resolve('/[...path]', { path: file.path })}>{file.name}</a>
		</div>
	{:else if file.type === 'file'}
		<div class="item">
			<span></span>
			<a href={resolve('/files/[...path]', { path: file.path })}>{file.name}</a>
		</div>
	{/if}
{/each}
