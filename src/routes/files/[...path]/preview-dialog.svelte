<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	type Props = {
		files: {
			name: string;
			type: string;
			size: number | null;
			path: string;
			modified: number;
		}[];
		i: number;
	};

	let { files, i }: Props = $props();
	const cid = $props.id();

	onMount(() => {
		const controller = new AbortController();

		window.addEventListener(
			'keyup',
			(e) => {
				// if (!state) return;
				// if (e.key === 'ArrowRight' && state.index < data.length) {
				// 	state.index += 1;
				// 	state.url = `/media/preview/${data.files[state.index].path}`;
				// } else if (e.key === 'ArrowLeft' && state.index > 0) {
				// 	state.index -= 1;
				// 	state.url = `/media/preview/${data.files[state.index].path}`;
				// }
			},
			{ signal: controller.signal }
		);

		return () => {
			controller.abort();
		};
	});
</script>

<button command="show-modal" commandfor="dialog-{cid}" class="btn btn-file">
	<img
		src={resolve('/media/[action]/[...path]', {
			action: 'thumbnail',
			path: files[i].path
		})}
		alt={files[i].name}
		loading="lazy"
	/>
	<span>{files[i].name}</span>
</button>

<dialog id="dialog-{cid}" closedby="any" class="dialog">
	<div class="wrapper">
		<div class="header">
			<span>{files[i].name}</span>
			<button
				command="request-close"
				commandfor="dialog-{cid}"
				class="btn btn-icon btn-secondary"
			>
				&times;
			</button>
		</div>

		<div class="content">
			<img
				src={resolve('/media/[action]/[...path]', {
					action: 'preview',
					path: files[i].path
				})}
				alt="Preview"
				loading="lazy"
			/>
		</div>

		<div class="actions">
			<a
				href={resolve('/media/[action]/[...path]', {
					action: 'raw',
					path: files[i].path
				})}
				class="btn btn-secondary"
			>
				View Original
			</a>
			<a
				href={resolve('/media/[action]/[...path]', {
					action: 'download',
					path: files[i].path
				})}
				target="_blank"
				class="btn btn-secondary"
			>
				Download
			</a>
		</div>
	</div>
</dialog>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
	}

	.header {
		padding: 1rem;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;

		& span {
			font-weight: bolder;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}
	}

	.actions {
		padding: 0.5rem;
		display: flex;
		justify-content: end;
		gap: 0.25rem;
	}
</style>
