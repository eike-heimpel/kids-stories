<script lang="ts">
	import type { Character } from '$lib/server/mongodb/types';
	import CharacterForm from '$lib/components/character/CharacterForm.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Get universeId from URL parameters
	$: universeId = $page.url.searchParams.get('universeId');

	// Initialize empty character with universeId from URL
	$: newCharacter = {
		name: '',
		description: '',
		universeId: universeId || '',
		createdAt: new Date(),
		updatedAt: new Date(),
		version: 1,
		lastModifiedBy: '', // Will be set by the server
		llmContext: {
			shortDescription: ''
		},
		mainCharacter: false,
		status: 'alive',
		traits: [],
		abilities: [],
		tags: []
	};

	let error: string | null = null;
	let loading = false;

	async function onSubmit(character: Character) {
		if (!universeId) {
			error = 'Universe ID is required';
			return;
		}

		loading = true;
		error = null;

		try {
			const response = await fetch('/api/characters', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(character)
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || 'Failed to create character');
			}

			await goto(`/private/characters?universeId=${universeId}`);
		} catch (e) {
			console.error('Error creating character:', e);
			error = e instanceof Error ? e.message : 'Failed to create character';
		} finally {
			loading = false;
		}
	}

	function onCancel() {
		goto(`/private/characters?universeId=${universeId}`);
	}
</script>

{#if !universeId}
	<div class="alert alert-error">
		<span class="material-icons">error</span>
		<span>Universe ID is required</span>
	</div>
{:else if error}
	<div class="alert alert-error">
		<span class="material-icons">error</span>
		<span>{error}</span>
	</div>
{:else}
	<CharacterForm character={newCharacter} {onSubmit} {onCancel} />
{/if}
