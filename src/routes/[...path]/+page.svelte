<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#each data.files as file (file.name)}
	<div>
		<a href={file.path}>{file.name}</a>
		<p>{file.path}</p>
	</div>
{/each}
