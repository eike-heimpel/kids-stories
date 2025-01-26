<script lang="ts">
	import type { PageData } from './$types';
	import EntityList from '$lib/components/shared/EntityList.svelte';

	export let data: PageData;
	const { plots, universe } = data;
</script>

<div class="container mx-auto p-4">
	<EntityList items={plots.items} title="Plots" entityType="plot" showCreateButton={true} />
</div>
