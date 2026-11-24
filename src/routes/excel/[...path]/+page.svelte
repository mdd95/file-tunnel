<script lang="ts">
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<div class="wrapper">
	<SvelteVirtualList items={data.rows}>
		{#snippet renderItem(item)}
			<div class="item">
				{#each Object.entries(item) as [key, value]}
					<div class="key">{key}</div>
					<div class="value">{value}</div>
				{/each}
			</div>
		{/snippet}
	</SvelteVirtualList>
</div>

<style>
	.wrapper {
		height: 100dvh;
	}

	.item {
		width: min(32rem, 100%);
		margin-inline: auto;
		margin-block-end: 0.5rem;
		padding: 1rem;
		display: grid;
		grid-template-columns: 1fr 3fr;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
	}

	.key,
	.value {
		padding: 0.25rem;
		display: flex;
		align-items: center;
	}

	.key {
		font-size: 0.875rem;
		color: var(--color-muted-text);
	}
</style>
