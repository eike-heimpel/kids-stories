<script lang="ts">
	import type { PageData } from './$types';
	import EntityList from '$lib/components/shared/EntityList.svelte';

	export let data: PageData;
	const { plots, universe } = data;
</script>

<div class="container mx-auto p-4">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold">Plots</h2>
		<a href={`/private/universes/${universe._id}/plots/new`} class="btn btn-primary">
			Create Plot
		</a>
	</div>
	<EntityList items={plots.items} title="Plots" entityType="plot" showCreateButton={true} />
</div>
