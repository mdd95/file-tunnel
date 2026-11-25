<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import Fuse, { type IFuseOptions } from 'fuse.js';
	import { Debounced } from 'runed';

	import { formatDate } from '#lib/client/utils.js';
	import { read } from '#lib/remote/excel.remote.js';

	const primary = ['JO Number', 'Nature of Work', 'Address'];

	type IData = Record<string, unknown>;

	const fuseOptions: IFuseOptions<IData> = {
		keys: ['JO Number', 'Address'],
		useTokenSearch: true,
		tokenMatch: 'all',
		includeScore: true
	};

	let searchInput = $state('');
	const debounced = new Debounced(() => searchInput, 500);

	function pick(obj: Record<string, unknown>, keys: string[]) {
		return Object.fromEntries(keys.map((key) => [key, obj[key]]));
	}

	async function setSearchParam(key: string, value: number | string) {
		const url = new URL(page.url.href);
		url.searchParams.set(key, typeof value === 'string' ? value : String(value));

		await goto(resolve('/excel/[...path]', { path: `${page.params.path ?? ''}${url.search}` }));
	}
</script>

<svelte:head>
	{const p = page.params.path ?? ''}
	{const q = p.lastIndexOf('/')}

	<title>{p.slice(q + 1)}</title>
</svelte:head>

<svelte:boundary>
	{const sheet = $derived(await read({ path: page.params.path ?? '', sheet: 0 }))}
	{const fuse = $derived(new Fuse(sheet.rows, fuseOptions))}
	{const filtered = $derived(fuse.search(debounced.current))}

	{#if page.url.searchParams.has('item')}
		{const item = Number(page.url.searchParams.get('item'))}

		{#if Number.isInteger(item) && item >= 0 && item < sheet.rows.length}
			<div class="view">
				<div class="item">
					{#each Object.entries(sheet.rows[item]) as [key, value]}
						<div class="key">{key}</div>
						<div class="value">
							{value instanceof Date ? formatDate(value) : value}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<div class="wrapper">
			<SvelteVirtualList items={filtered}>
				{#snippet header()}
					<div class="toolbar">
						<select
							onchange={async (e) => {
								const el = e.target as HTMLSelectElement;
								await setSearchParam('sheet', el.value);
							}}
						>
							{#each sheet.sheetNames as sheetName, i}
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
					<button
						type="button"
						class="item"
						onclick={() => setSearchParam('item', item.refIndex)}
					>
						{#each Object.entries(pick(item.item, primary)) as [key, value]}
							<div class="key">{key}</div>
							<div class="value">{value}</div>
						{/each}
					</button>
				{/snippet}
			</SvelteVirtualList>
		</div>
	{/if}

	{#snippet pending()}
		<div>Loading!!!</div>
	{/snippet}
</svelte:boundary>

<style>
	.toolbar {
		width: min(32rem, 100%);
		margin-bottom: 1rem;
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

		& :global(.virtual-list-items > div),
		& :global(:has(> .toolbar)) {
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
