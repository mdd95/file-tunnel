<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';

	import favicon from '#lib/assets/favicon.svg';
	import { preloadscript, setmode } from '#lib/client/theme-mode.svelte.js';

	let { children } = $props();

	onMount(() => {
		const mode = window.localStorage.getItem('theme-mode');
		if (mode && new Set(['light', 'dark']).has(mode)) setmode(mode);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{@html preloadscript}
</svelte:head>

{@render children()}
