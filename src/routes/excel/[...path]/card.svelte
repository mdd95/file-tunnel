<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let {
		data,
		refIndex,
		keys
	}: {
		data: Record<string, unknown>;
		refIndex: number;
		keys: string[];
	} = $props();

	const entries = $derived(keys.map<[string, unknown]>((key) => [key, data[key]]));

	async function setSearchParam(key: string, value: number | string) {
		const url = new URL(page.url.href);
		url.searchParams.set(key, String(value));

		await goto(
			resolve('/excel/[...path]', {
				path: `${page.params.path ?? ''}${url.search}`
			})
		);
	}
</script>

<button type="button" class="item" onclick={() => setSearchParam('item', refIndex)}>
	{#each entries as [key, value]}
		<div class="key">{key}</div>
		<div class="value">{value}</div>
	{/each}
</button>

<style>
	.item {
		width: min(32rem, 100%);
		margin-block-end: 0.5rem;
		padding: 1rem;
		display: grid;
		grid-template-columns: 1fr 3fr;
		background-color: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		box-shadow:
			0 1px 2px rgb(0 0 0 / 0.06),
			0 2px 4px rgb(0 0 0 / 0.06);
		text-align: start;
		cursor: pointer;

		&:hover {
			background-color: alpha(from var(--color-primary) / 0.06);
			border-color: alpha(from var(--color-primary) / 0.1);
		}
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
