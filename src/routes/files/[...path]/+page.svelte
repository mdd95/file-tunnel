<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	$effect(() => {
		console.log(data);
	});
</script>

<header>
	<div>
		<button class="btn btn-icon">&LeftArrow;</button>
		<button class="btn btn-icon">&RightArrow;</button>
		<button class="btn btn-icon">&UpArrow;</button>
		<button class="btn btn-icon">&#x27F3;</button>
	</div>
	<div class="location">
		<button class="btn">Home</button>
	</div>
	<div>
		<button class="btn btn-icon">▦</button>
		<button class="btn btn-icon">▦</button>
		<button class="btn btn-icon">☷</button>
		<button class="btn btn-icon">☰</button>
	</div>
</header>
<main>
	{#each data.files as file (file.name)}
		{#if file.type === 'directory'}
			<div class="file">
				<div>📁</div>
				<a href={resolve('/files/[...path]', { path: file.path })}>{file.name}</a>
			</div>
		{:else if file.isImage}
			<div class="file">
				<img src={file.thumbnailPath} alt={file.name} loading="lazy" />
				<a href={resolve('/view/[...path]', { path: file.path })}>{file.name}</a>
			</div>
		{:else if file.type === 'file'}
			<div class="file">
				<div></div>
				<a href={resolve('/view/[...path]', { path: file.path })}>{file.name}</a>
			</div>
		{/if}
	{/each}
</main>

<style>
	header {
		height: 4rem;
		padding: 0 1rem;
		display: flex;
		gap: 0.5rem;
		border-bottom: 1px solid rgb(0 0 0 / 0.2);

		& > * {
			display: flex;
			align-items: center;
		}

		& .location {
			flex-grow: 1;
		}
	}

	.btn {
		height: 2rem;
		padding: 0 0.5rem;
		display: grid;
		place-items: center;
		border-radius: var(--radius-md);
		background-color: transparent;

		@media (hover: hover) {
			&:hover {
				background-color: rgb(0 0 0 / 0.1);
			}
		}
	}

	.btn-icon {
		width: 2rem;
		height: 2rem;
	}

	main {
		display: flex;
		flex-direction: column;
	}

	.file {
		height: 3.5rem;
		padding: 0 2rem;
		display: grid;
		grid-template-columns: 3.5rem 1fr;
		align-items: center;
		gap: 1rem;

		@media (hover: hover) {
			&:hover {
				background-color: rgb(0 0 0 / 0.1);
			}
		}

		& a {
			width: 100%;
			overflow: hidden;
			text-wrap: nowrap;
		}
	}

	img {
		height: 3.5rem;
		aspect-ratio: 1 / 1;
	}
</style>
