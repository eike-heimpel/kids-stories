<script lang="ts">
	import { onMount } from 'svelte';
	import type { Universe } from '$lib/server/mongodb/types';
	import EntityList from '$lib/components/shared/EntityList.svelte';

	let universes: Universe[] = [];
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			const response = await fetch('/api/universes');
			if (!response.ok) {
				throw new Error('Failed to load universes');
			}
			const data = await response.json();
			universes = data.items;
		} catch (e) {
			console.error('Error loading universes:', e);
			error = 'Failed to load universes';
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else if error}
	<div class="alert alert-error">
		<span class="material-icons">error</span>
		<span>{error}</span>
	</div>
{:else}
	<EntityList items={universes} title="Story Universes" entityType="private/universes" />
{/if}
