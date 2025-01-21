<script lang="ts">
	import {
		universeFormSchema,
		universeSchema,
		type Universe,
		type UniverseForm
	} from '$lib/schemas/universe';
	import { createFormValidation } from '$lib/stores/formValidation';
	import LLMContextForm from '../shared/LLMContextForm.svelte';
	import EntityForm from '../shared/EntityForm.svelte';
	import FormField from '../shared/FormField.svelte';
	import ArrayField from '../shared/ArrayField.svelte';
	import ObjectField from '../shared/ObjectField.svelte';
	import { page } from '$app/stores';
	import { addToast } from '$lib/components/toastStore';
	import type { EntityWithCommon } from '$lib/types/forms';

	export let universe: Universe;
	export let onSubmit: (data: Universe) => Promise<void>;
	export let onCancel: () => void;

	const validation = createFormValidation(universeFormSchema);

	// Get query parameters if they exist
	$: if ($page?.url?.searchParams) {
		const name = $page.url.searchParams.get('name');
		const language = $page.url.searchParams.get('language');
		if (name && !universe.name) universe.name = name;
		if (language && !universe.language) universe.language = language;
	}

	// Initialize fields with defaults from schema
	universe.targetAgeRange = universe.targetAgeRange || { min: 0, max: 0 };
	universe.genre = universe.genre || [];
	universe.tags = universe.tags || [];
	// Ensure llmContext exists with required fields
	universe.llmContext = {
		...(universe.llmContext || {}),
		shortDescription: universe.llmContext?.shortDescription || ''
	};

	// Handle form submission wrapper
	const handleSubmit = async (data: Universe) => {
		try {
			await onSubmit(data);
			addToast('Universe saved successfully', 'success');
		} catch (error) {
			console.error('Error saving universe:', error);
			addToast('Failed to save universe', 'error');
			throw error;
		}
	};

	// Handle AI assist changes
	function handleAIChanges(event: CustomEvent<Record<string, any>>) {
		const changes = event.detail;
		if (changes.genre) universe.genre = changes.genre || [];
		if (changes.tags) universe.tags = changes.tags || [];
		if (changes.targetAgeRange) universe.targetAgeRange = changes.targetAgeRange;
		if (changes.llmContext) {
			universe.llmContext = {
				...(universe.llmContext || {}),
				...changes.llmContext,
				shortDescription:
					changes.llmContext.shortDescription || universe.llmContext.shortDescription || ''
			};
		}
		validation.validate(universe);
	}
</script>

<EntityForm
	entity={universe}
	entityType="universe"
	onSubmit={async (data: any) => {
		try {
			await onSubmit(data);
			addToast('Universe saved successfully', 'success');
		} catch (error) {
			console.error('Error saving universe:', error);
			addToast('Failed to save universe', 'error');
			throw error;
		}
	}}
	{onCancel}
	{validation}
	on:aichanges={handleAIChanges}
>
	<FormField
		schema={universeSchema}
		path="language"
		label="Language"
		bind:value={universe.language}
		validation={$validation}
	/>

	<FormField
		schema={universeSchema}
		path="description"
		label="Description"
		type="textarea"
		bind:value={universe.description}
		validation={$validation}
	/>

	<ArrayField
		schema={universeSchema}
		path="genre"
		label="Genres"
		bind:value={universe.genre}
		validation={$validation}
		placeholder="Fantasy, Science Fiction, etc. (comma-separated)"
	/>

	<ArrayField
		schema={universeSchema}
		path="tags"
		label="Tags"
		bind:value={universe.tags}
		validation={$validation}
		placeholder="magic, technology, etc. (comma-separated)"
	/>

	<ObjectField
		schema={universeSchema}
		path="targetAgeRange"
		label="Target Age Range"
		bind:value={universe.targetAgeRange}
		validation={$validation}
		fields={[
			{ key: 'min', label: 'Min', type: 'number', placeholder: 'Min' },
			{ key: 'max', label: 'Max', type: 'number', placeholder: 'Max' }
		]}
	/>

	<FormField
		schema={universeSchema}
		path="coverImageUrl"
		label="Cover Image URL"
		type="url"
		bind:value={universe.coverImageUrl}
		placeholder="https://..."
		validation={$validation}
	/>

	<div class="divider">LLM Context</div>

	<LLMContextForm bind:context={universe.llmContext} />
</EntityForm>
