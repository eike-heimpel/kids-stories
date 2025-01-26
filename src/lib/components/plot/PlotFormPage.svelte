<script lang="ts">
	import type { Plot } from '$lib/schemas/plot';
	import PlotForm from './PlotForm.svelte';
	import EntityFormPage from '$lib/components/shared/EntityFormPage.svelte';

	interface UniverseInfo {
		_id: string;
		name: string;
	}

	export let universe: UniverseInfo;
	export let plot: Partial<Plot> = {
		title: '',
		name: '',
		summary: '',
		description: '',
		isPublic: false,
		status: 'draft' as const,
		plotPoints: [],
		mainCharacters: [],
		tags: [],
		timeframe: {
			start: new Date()
		},
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

	const apiPath = `/private/universes/${universe._id}/plots`;
	const layoutPath = `/private/universes/${universe._id}/plots`;
</script>

<EntityFormPage
	entity={plot}
	entityType="plot"
	parent={universe}
	basePath={apiPath}
	returnPath={apiPath}
	layoutBasePath={layoutPath}
>
	<svelte:fragment slot="default" let:handleSubmit let:handleCancel>
		<PlotForm plot={plot as Plot} onSubmit={handleSubmit} onCancel={handleCancel} />
	</svelte:fragment>
</EntityFormPage>
