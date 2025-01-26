<script lang="ts">
	import { plotFormSchema, plotSchema, type Plot } from '$lib/schemas/plot';
	import { createFormValidation } from '$lib/stores/formValidation';
	import LLMContextForm from '../shared/LLMContextForm.svelte';
	import EntityForm from '../shared/EntityForm.svelte';
	import FormField from '../shared/FormField.svelte';
	import ArrayField from '../shared/ArrayField.svelte';
	import EnumField from '../shared/EnumField.svelte';
	import { addToast } from '$lib/components/toastStore';
	import PlotPointForm from './PlotPointForm.svelte';

	export let plot: Plot;
	export let onSubmit: (data: Plot) => void;
	export let onCancel: () => void;

	const validation = createFormValidation(plotFormSchema);

	// Initialize fields with defaults from schema
	plot.plotPoints = plot.plotPoints || [];
	plot.mainCharacters = plot.mainCharacters || [];
	plot.tags = plot.tags || [];
	plot.llmContext = {
		...(plot.llmContext || {}),
		shortDescription: plot.llmContext?.shortDescription || ''
	};

	// Status options
	const statusOptions = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'in-progress', label: 'In Progress' },
		{ value: 'completed', label: 'Completed' }
	];

	function handleChange() {
		validation.validate(plot);
	}

	// Handle AI assist changes
	function handleAIChanges(event: CustomEvent<Record<string, any>>) {
		const changes = event.detail;

		// Update plot fields if present in changes
		Object.entries(changes).forEach(([key, value]) => {
			if (key === 'llmContext') {
				plot.llmContext = {
					...(plot.llmContext || {}),
					...value,
					shortDescription: value.shortDescription || plot.llmContext?.shortDescription || ''
				};
			} else if (key in plot) {
				// Only update if the key exists in plot
				(plot as any)[key] = value;
			}
		});

		// Trigger validation after updates
		validation.validate(plot);
	}
</script>

<EntityForm
	entity={plot}
	entityType="plot"
	onSubmit={async (data: any) => {
		// Ensure title is copied to name for compatibility with base entity
		data.name = data.title;
		if (validation.validate(data)) {
			try {
				await onSubmit(data);
			} catch (error) {
				console.error('Error saving plot:', error);
				addToast('Failed to save plot', 'error');
				throw error;
			}
		}
	}}
	{onCancel}
	{validation}
	on:aichanges={handleAIChanges}
>
	<div class="form-control" slot="name-field">
		<label class="label" for="title">
			<span class="label-text">Title <span class="text-error">*</span></span>
		</label>
		<input
			type="text"
			id="title"
			class="input input-bordered"
			class:input-error={$validation?.getFieldError('title')}
			bind:value={plot.title}
		/>
		{#if $validation?.getFieldError('title')}
			<label class="label">
				<span class="label-text-alt text-error">{$validation.getFieldError('title')}</span>
			</label>
		{/if}
	</div>

	<FormField
		schema={plotSchema}
		path="summary"
		label="Summary"
		type="textarea"
		bind:value={plot.summary}
		validation={$validation}
	/>

	<div class="grid gap-4 md:grid-cols-2">
		<EnumField
			schema={plotSchema}
			path="status"
			label="Status"
			bind:value={plot.status}
			options={statusOptions}
			validation={$validation}
		/>

		<FormField
			schema={plotSchema}
			path="timeframe.duration"
			label="Duration"
			bind:value={plot.timeframe.duration}
			validation={$validation}
		/>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<FormField
			schema={plotSchema}
			path="timeframe.start"
			label="Start Date"
			type="datetime-local"
			bind:value={plot.timeframe.start}
			validation={$validation}
		/>

		<FormField
			schema={plotSchema}
			path="timeframe.end"
			label="End Date"
			type="datetime-local"
			bind:value={plot.timeframe.end}
			validation={$validation}
		/>
	</div>

	<ArrayField
		schema={plotSchema}
		path="mainCharacters"
		label="Main Characters"
		bind:value={plot.mainCharacters}
		validation={$validation}
		placeholder="Character IDs (comma-separated)"
	/>

	<ArrayField
		schema={plotSchema}
		path="tags"
		label="Tags"
		bind:value={plot.tags}
		validation={$validation}
		placeholder="adventure, mystery, etc. (comma-separated)"
	/>

	<div class="divider">Plot Points</div>

	<PlotPointForm bind:plotPoints={plot.plotPoints} />

	<div class="divider">LLM Context</div>

	<LLMContextForm bind:context={plot.llmContext} />
</EntityForm>
