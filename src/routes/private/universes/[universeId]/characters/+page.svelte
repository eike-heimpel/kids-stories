<script lang="ts">
	import type { PageData } from './$types';
	import EntityList from '$lib/components/shared/EntityList.svelte';

	export let data: PageData;
	const { characters, universe } = data;
</script>

<div class="grid gap-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold">Characters</h2>
		<a href={`/private/universes/${universe._id}/characters/new`} class="btn btn-primary">
			Create Character
		</a>
	</div>

	<EntityList items={characters} entityType="character" showCreateButton={false} />
</div>
