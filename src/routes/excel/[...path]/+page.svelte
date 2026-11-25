<script lang="ts">
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import Fuse from 'fuse.js';
	import { Debounced } from 'runed';
	import type { PageServerData } from './$types';

	type Props = {
		data: PageServerData;
	};

	let { data }: Props = $props();

	const primary = ['JO Number', 'Nature of Work', 'Address'];

	const fuse = new Fuse(data.rows, {
		keys: ['JO Number', 'Address'],
		useTokenSearch: true,
		tokenMatch: 'all',
		includeScore: true
	});

	let inp = $state('');
	const debounced = new Debounced(() => inp, 500);
	let filtered = $derived(fuse.search(debounced.current));

	function pick(obj: Record<string, unknown>, keys: string[]) {
		return Object.fromEntries(keys.map((key) => [key, obj[key]]));
	}
</script>

<svelte:head>
	<title>{data.fileName}</title>
</svelte:head>

<div class="wrapper">
	<SvelteVirtualList items={filtered}>
		{#snippet header()}
			<div class="toolbar">
				<input
					type="text"
					bind:value={inp}
					placeholder="Search {['JO Number', 'Address'].join(', ')}"
				/>
			</div>
		{/snippet}

		{#snippet renderItem(item)}
			<div class="item">
				{#each Object.entries(pick(item.item, primary)) as [key, value]}
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
		padding: 0 1rem;
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

		& :global(.virtual-list-items > div) {
			padding: 0 1rem;
			display: flex;
			justify-content: center;
		}
	}

	.item {
		width: min(32rem, 100%);
		margin-block-end: 0.5rem;
		padding: 1rem;
		display: grid;
		grid-template-columns: 1fr 3fr;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
	}

	.key,
	.value {
		display: flex;
		align-items: center;
	}

	.key {
		font-size: 0.875rem;
		color: var(--color-muted-text);
	}
</style>
