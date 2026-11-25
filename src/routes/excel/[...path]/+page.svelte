<script lang="ts">
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import Fuse from 'fuse.js';
	import { Debounced } from 'runed';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { formatDate } from '#lib/client/utils.js';
	import type { PageServerData } from './$types';

	type Props = {
		data: PageServerData;
	};

	let { data }: Props = $props();

	const primary = ['JO Number', 'Nature of Work', 'Address'];

	const fuse = $derived(
		new Fuse(data.rows, {
			keys: ['JO Number', 'Address'],
			useTokenSearch: true,
			tokenMatch: 'all',
			includeScore: true
		})
	);

	let searchInput = $state('');
	const debounced = new Debounced(() => searchInput, 500);

	const filtered = $derived(fuse.search(debounced.current));

	function pick(obj: Record<string, unknown>, keys: string[]) {
		return Object.fromEntries(keys.map((key) => [key, obj[key]]));
	}

	async function selectSheet(index: number) {
		const url = new URL(page.url.href);
		url.searchParams.set('sheet', String(index));

		await goto(url);
	}

	async function selectItem(index: number) {
		const url = new URL(page.url.href);
		url.searchParams.set('index', String(index));

		await goto(url);
	}
</script>

<svelte:head>
	<title>{data.fileName}</title>
</svelte:head>

{#if page.url.searchParams.has('index')}
	<div class="view">
		<div class="item">
			{#each Object.entries(data.rows[Number(page.url.searchParams.get('index'))]) as [key, value]}
				<div class="key">{key}</div>
				<div class="value">
					{value instanceof Date ? formatDate(value) : value}
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="wrapper">
		<SvelteVirtualList items={filtered}>
			{#snippet header()}
				<div class="toolbar">
					<select
						onchange={(e) => selectSheet(Number((e.target as HTMLSelectElement).value))}
					>
						{#each data.sheetNames as sheetName, i}
							<option value={i}>{sheetName}</option>
						{/each}
					</select>
					<input
						type="text"
						bind:value={searchInput}
						aria-label="Search item"
						placeholder="Search {['JO Number', 'Address'].join(', ')}"
					/>
				</div>
			{/snippet}

			{#snippet renderItem(item)}
				<button type="button" class="item" onclick={() => selectItem(item.refIndex)}>
					{#each Object.entries(pick(item.item, primary)) as [key, value]}
						<div class="key">{key}</div>
						<div class="value">{value}</div>
					{/each}
				</button>
			{/snippet}
		</SvelteVirtualList>
	</div>
{/if}

<style>
	.toolbar {
		width: min(32rem, 100%);
		padding: 0 1rem;
		margin-inline: auto;
		height: 4rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.25rem;

		& :where(input, select) {
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
		background-color: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		text-align: start;
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

	.view {
		margin: 1rem 1rem;
		display: flex;
		justify-content: center;
	}
</style>
