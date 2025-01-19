<script lang="ts">
	import type { Character } from '$lib/server/mongodb/types';
	import CharacterForm from '$lib/components/character/CharacterForm.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let character: Character | null = null;
	let error: string | null = null;
	let loading = true;

	async function loadCharacter() {
		try {
			const response = await fetch(`/api/characters/${$page.params.id}`);
			if (!response.ok) {
				throw new Error((await response.text()) || 'Failed to load character');
			}
			character = await response.json();
		} catch (e) {
			console.error('Error loading character:', e);
			error = e instanceof Error ? e.message : 'Failed to load character';
		} finally {
			loading = false;
		}
	}

	async function handleSubmit(updatedCharacter: Character) {
		try {
			const { _id, ...updateData } = updatedCharacter;

			const response = await fetch(`/api/characters/${$page.params.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(updateData)
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || 'Failed to update character');
			}

			await goto(`/private/characters/${$page.params.id}`);
		} catch (e) {
			console.error('Error updating character:', e);
			error = e instanceof Error ? e.message : 'Failed to update character';
		}
	}

	function handleCancel() {
		goto(`/private/characters/${$page.params.id}`);
	}

	onMount(loadCharacter);
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
{:else if character}
	<CharacterForm {character} onSubmit={handleSubmit} onCancel={handleCancel} />
{/if}
