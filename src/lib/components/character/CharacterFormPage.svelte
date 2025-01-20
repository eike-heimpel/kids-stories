<script lang="ts">
	import type { Character } from '$lib/server/mongodb/types';
	import { goto, invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/components/toastStore';
	import { invalidate } from '$app/navigation';
	import CharacterForm from './CharacterForm.svelte';
	import type { ObjectId } from 'mongodb';

	interface UniverseInfo {
		_id: string;
		name: string;
	}

	export let universe: UniverseInfo;
	export let character: Partial<Character & { _id?: string | ObjectId }> = {
		name: '',
		description: '',
		backstory: '',
		traits: [],
		abilities: [],
		mainCharacter: false,
		status: 'alive' as const,
		universeId: universe._id,
		llmContext: {
			shortDescription: '',
			longDescription: '',
			keyPoints: [],
			relationships: '',
			hiddenInformation: '',
			storyImplications: '',
			tone: '',
			systemNotes: ''
		}
	};

	const isEdit = !!character._id;

	async function handleSubmit(characterData: Partial<Character>) {
		try {
			const endpoint = isEdit
				? `/private/universes/${universe._id}/characters/${character._id}`
				: `/private/universes/${universe._id}/characters`;

			const response = await fetch(endpoint, {
				method: isEdit ? 'PUT' : 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(characterData)
			});

			if (!response.ok) {
				throw new Error(await response.text());
			}

			const savedCharacter = await response.json();
			const characterId = savedCharacter._id?.toString() || savedCharacter._id;

			// Show success message
			addToast(`Character ${isEdit ? 'updated' : 'created'} successfully`, 'success');

			// Invalidate the parent layout that contains the characters list
			await invalidate(`/private/universes/${universe._id}`);

			// Then navigate to the character detail view
			await goto(`/private/universes/${universe._id}/characters/${characterId}`);
		} catch (e) {
			console.error(`Error ${isEdit ? 'updating' : 'creating'} character:`, e);
			addToast(
				e instanceof Error ? e.message : `Failed to ${isEdit ? 'update' : 'create'} character`,
				'error'
			);
		}
	}

	function handleCancel() {
		const path = isEdit
			? `/private/universes/${universe._id}/characters/${character._id}`
			: `/private/universes/${universe._id}/characters`;
		goto(path);
	}
</script>

<div class="container mx-auto max-w-4xl p-4">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-3xl">{isEdit ? 'Edit' : 'Create New'} Character</h2>
			<p class="opacity-60">
				{#if isEdit}
					Editing {character.name} in {universe.name}
				{:else}
					Add a new character to {universe.name}
				{/if}
			</p>

			<CharacterForm {character} onSubmit={handleSubmit} onCancel={handleCancel} />
		</div>
	</div>
</div>
