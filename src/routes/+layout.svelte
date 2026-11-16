<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { modeFnStr } from '#lib/client/theme-mode.js';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{@html modeFnStr}
</svelte:head>

{@render children()}
