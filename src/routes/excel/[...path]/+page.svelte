<script lang="ts">
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import type { PageServerData } from './$types';

	type Props = {
		data: PageServerData;
	};

	let { data }: Props = $props();
	const TOKEN = ['Address'];

	const normalize = (str: string) =>
		str
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^\p{L}\p{N}]+/gu, ' ')
			.trim();

	const tokenize = $derived(
		data.rows.map((row) => {
			const token = new Set<string>();

			for (const key of TOKEN) {
				if (typeof row[key] !== 'string') continue;

				for (const word of normalize(row[key]).split(/\s+/)) {
					if (word) token.add(word);
				}
			}

			return { data: row, token };
		})
	);

	let inp = $state('');

	let inputTokens = $derived(normalize(inp).split(/\s+/).filter(Boolean));

	let fdata = $derived(
		inputTokens.length
			? tokenize.filter(({ token }) =>
					inputTokens.every((input) => [...token].some((word) => word.startsWith(input)))
				)
			: tokenize
	);
</script>

<div class="wrapper">
	<div class="toolbar">
		<input type="text" bind:value={inp} />
	</div>

	<SvelteVirtualList items={fdata}>
		{#snippet renderItem(item)}
			<div class="item">
				{#each Object.entries(item.data) as [key, value]}
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
