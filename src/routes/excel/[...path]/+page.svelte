<script lang="ts">
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import Fuse from 'fuse.js';
	import type { PageServerData } from './$types';

	type Props = {
		data: PageServerData;
	};

	let { data }: Props = $props();

	const fuse = new Fuse(data.rows, {
		keys: ['JO Number', 'Address'],
		useTokenSearch: true,
		tokenMatch: 'all',
		includeScore: true
	});

	let inp = $state('');
	let filtered = $derived(fuse.search(inp));
</script>

<div class="wrapper">
	<SvelteVirtualList items={filtered}>
		{#snippet header()}
			<div class="toolbar">
				<input type="text" bind:value={inp} />
			</div>
		{/snippet}

		{#snippet renderItem(item)}
			<div class="item">
				{#each Object.entries(item.item) as [key, value]}
					<div class="key">{key}</div>
					<div class="value">{value}</div>
				{/each}
			</div>
		{/snippet}
	</SvelteVirtualList>
</div>

<style>
	.toolbar {
		width: min(32rem, 100%);
		margin-inline: auto;
		height: 4rem;
		display: flex;
		align-items: center;

		& input {
			width: 100%;
			padding: 0.5rem;
			border: 1px solid var(--color-border);
		}
	}

	.wrapper {
		height: 100dvh;
		display: flex;
		flex-direction: column;
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
