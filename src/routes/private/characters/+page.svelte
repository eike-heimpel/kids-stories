<script lang="ts">
	import { onMount } from 'svelte';
	import type { Character } from '$lib/server/mongodb/types';
	import EntityList from '$lib/components/shared/EntityList.svelte';
	import { page } from '$app/stores';

	let characters: Character[] = [];
	let loading = true;
	let error: string | null = null;

	// Get universeId from URL parameters
	$: universeId = $page.url.searchParams.get('universeId');

	onMount(async () => {
		if (!universeId) {
			error = 'Universe ID is required';
			loading = false;
			return;
		}

		try {
			const response = await fetch(`/api/characters?universeId=${universeId}`);
			if (!response.ok) {
				throw new Error('Failed to load characters');
			}
			const data = await response.json();
			characters = data.items;
		} catch (e) {
			console.error('Error loading characters:', e);
			error = 'Failed to load characters';
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<span class="loading loading-spinner loading-lg" />
	</div>
{:else if error}
	<div class="alert alert-error">
		<span class="material-icons">error</span>
		<span>{error}</span>
	</div>
{:else}
	<EntityList items={characters} title="Characters" entityType="character" />
{/if}
