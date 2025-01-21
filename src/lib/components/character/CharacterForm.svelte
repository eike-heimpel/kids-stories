<script lang="ts">
	import {
		characterFormSchema,
		characterSchema,
		type Character,
		type CharacterForm
	} from '$lib/schemas/character';
	import { createFormValidation } from '$lib/stores/formValidation';
	import LLMContextForm from '../shared/LLMContextForm.svelte';
	import EntityForm from '../shared/EntityForm.svelte';
	import FormField from '../shared/FormField.svelte';
	import ArrayField from '../shared/ArrayField.svelte';
	import EnumField from '../shared/EnumField.svelte';
	import { addToast } from '$lib/components/toastStore';

	export let character: Character;
	export let onSubmit: (data: Character) => void;
	export let onCancel: () => void;

	const validation = createFormValidation(characterFormSchema);

	// Initialize fields with defaults from schema
	character.traits = character.traits || [];
	character.abilities = character.abilities || [];
	character.relationships = character.relationships || [];
	character.llmContext = {
		...(character.llmContext || {}),
		shortDescription: character.llmContext?.shortDescription || ''
	};

	// Status options
	const statusOptions = [
		{ value: 'alive', label: 'Alive' },
		{ value: 'deceased', label: 'Deceased' },
		{ value: 'unknown', label: 'Unknown' }
	];

	function handleChange() {
		validation.validate(character);
	}

	// Handle AI assist changes
	function handleAIChanges(event: CustomEvent<Record<string, any>>) {
		const changes = event.detail;

		// Update character fields if present in changes
		if (changes.traits) {
			character.traits = changes.traits || [];
		}
		if (changes.abilities) {
			character.abilities = changes.abilities || [];
		}
		if (changes.backstory) {
			character.backstory = changes.backstory;
		}
		if (changes.llmContext) {
			character.llmContext = {
				...(character.llmContext || {}),
				...changes.llmContext,
				shortDescription:
					changes.llmContext.shortDescription || character.llmContext.shortDescription || ''
			};
		}
		validation.validate(character);
	}

	// Handle form submission
	async function handleSubmit() {
		if (validation.validate(character)) {
			await onSubmit(character);
		}
	}
</script>

<EntityForm
	entity={character}
	entityType="character"
	onSubmit={async (data: any) => {
		if (validation.validate(data)) {
			try {
				await onSubmit(data);
			} catch (error) {
				console.error('Error saving character:', error);
				addToast('Failed to save character', 'error');
				throw error;
			}
		}
	}}
	{onCancel}
	{validation}
	on:aichanges={handleAIChanges}
>
	<FormField
		schema={characterSchema}
		path="description"
		label="Description"
		type="textarea"
		bind:value={character.description}
		validation={$validation}
	/>

	<FormField
		schema={characterSchema}
		path="backstory"
		label="Backstory"
		type="textarea"
		bind:value={character.backstory}
		validation={$validation}
	/>

	<div class="grid gap-4 md:grid-cols-2">
		<FormField
			schema={characterSchema}
			path="species"
			label="Species"
			bind:value={character.species}
			validation={$validation}
		/>

		<FormField
			schema={characterSchema}
			path="age"
			label="Age"
			type="number"
			bind:value={character.age}
			validation={$validation}
		/>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<EnumField
			schema={characterSchema}
			path="status"
			label="Status"
			bind:value={character.status}
			options={statusOptions}
			validation={$validation}
		/>

		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text">Main Character</span>
				<input type="checkbox" class="toggle" bind:checked={character.mainCharacter} />
			</label>
		</div>
	</div>

	<ArrayField
		schema={characterSchema}
		path="traits"
		label="Traits"
		bind:value={character.traits}
		validation={$validation}
		placeholder="brave, loyal, intelligent, etc. (comma-separated)"
	/>

	<ArrayField
		schema={characterSchema}
		path="abilities"
		label="Abilities"
		bind:value={character.abilities}
		validation={$validation}
		placeholder="magic, swordsmanship, healing, etc. (comma-separated)"
	/>

	<FormField
		schema={characterSchema}
		path="imageUrl"
		label="Image URL"
		type="url"
		bind:value={character.imageUrl}
		placeholder="https://..."
		validation={$validation}
	/>

	<div class="divider">LLM Context</div>

	<LLMContextForm bind:context={character.llmContext} />
</EntityForm>
