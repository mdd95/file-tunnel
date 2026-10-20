<script lang="ts" module>
	export type PreviewState = {
		index: number;
		url: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	type DirectoryData = {
		length: number;
		files: { name: string; type: string; size: number | null; path: string; modified: number }[];
	};

	type Props = {
		data: DirectoryData;
		state: PreviewState | null;
	};

	let { data, state = $bindable() }: Props = $props();

	onMount(() => {
		const controller = new AbortController();

		window.addEventListener(
			'keyup',
			(e) => {
				if (!state) return;
				if (e.key === 'ArrowRight' && state.index < data.length) {
					state.index += 1;
					state.url = `/view/${data.files[state.index].path}`;
				} else if (e.key === 'ArrowLeft' && state.index > 0) {
					state.index -= 1;
					state.url = `/view/${data.files[state.index].path}`;
				}
			},
			{ signal: controller.signal }
		);

		return () => {
			controller.abort();
		};
	});
</script>

<dialog id="preview-dialog" closedby="any" onclose={() => (state = null)}>
	<div class="dialog">
		<div class="dialog-header"></div>
		<div class="dialog-content">
			{#if state}
				<img src={state.url} alt="Preview" loading="lazy" />
			{/if}
		</div>
		{#if state}
			<div class="dialog-actions">
				<a href={state.url} class="btn">View Original</a>
				<button class="btn">Download</button>
			</div>
		{/if}
	</div>
</dialog>

<style>
	dialog {
		--t-duration: 60ms;
		width: min(90vw, 62.5rem);
		height: min(90dvh, 52rem);
		margin: auto;
		padding: 1rem;
		background-color: #f0f0f0;
		border: 0;
		border-radius: 1rem;
		overscroll-behavior: contain;

		opacity: 0;
		transform: translateY(-10px);
		transition:
			opacity var(--t-duration) ease-out,
			transform var(--t-duration) ease-out,
			overlay var(--t-duration) ease-out allow-discrete,
			display var(--t-duration) ease-out allow-discrete;
	}

	dialog:open {
		opacity: 1;
		transform: translateY(0);

		@starting-style {
			opacity: 0;
			transform: translateY(-10px);
		}
	}

	dialog::backdrop {
		background-color: transparent;
		overscroll-behavior: contain;
		overflow: hidden;
		transition:
			display var(--t-duration) allow-discrete,
			overlay var(--t-duration) allow-discrete,
			background-color var(--t-duration);
	}

	dialog:open::backdrop {
		background-color: rgb(0 0 0 / 0.25);

		@starting-style {
			background-color: transparent;
		}
	}

	.dialog {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	.dialog-header {
		height: 3.5rem;
	}

	.dialog-content {
		flex: 1 1 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;

		& img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: contain;
			object-position: center;
		}
	}

	.dialog-actions {
		height: 3.5rem;
		display: flex;
		align-items: center;
		justify-content: end;
		gap: 0.5rem;
	}
</style>
