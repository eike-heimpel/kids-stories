<script lang="ts">
	import type { PlotPoint } from '$lib/schemas/plot';
	import FormField from '../shared/FormField.svelte';
	import EnumField from '../shared/EnumField.svelte';
	import ArrayField from '../shared/ArrayField.svelte';
	import { plotSchema } from '$lib/schemas/plot';

	export let plotPoints: PlotPoint[] = [];

	// Detail level options
	const detailLevelOptions = [
		{ value: 'major', label: 'Major' },
		{ value: 'minor', label: 'Minor' }
	];

	// Character role options
	const characterRoleOptions = [
		{ value: 'active', label: 'Active' },
		{ value: 'passive', label: 'Passive' },
		{ value: 'mentioned', label: 'Mentioned' }
	];

	function addPlotPoint() {
		plotPoints = [
			...plotPoints,
			{
				title: '',
				description: '',
				order: plotPoints.length,
				timestamp: new Date(),
				duration: '',
				detailLevel: 'major',
				location: {
					primary: '',
					mentioned: []
				},
				characters: [],
				items: [],
				llmContext: {
					shortDescription: ''
				}
			}
		];
	}

	function removePlotPoint(index: number) {
		plotPoints = plotPoints.filter((_, i) => i !== index);
		// Update order of remaining plot points
		plotPoints = plotPoints.map((point, i) => ({
			...point,
			order: i
		}));
	}

	function movePlotPoint(index: number, direction: 'up' | 'down') {
		if (direction === 'up' && index > 0) {
			const temp = plotPoints[index - 1];
			plotPoints[index - 1] = { ...plotPoints[index], order: index - 1 };
			plotPoints[index] = { ...temp, order: index };
			plotPoints = [...plotPoints];
		} else if (direction === 'down' && index < plotPoints.length - 1) {
			const temp = plotPoints[index + 1];
			plotPoints[index + 1] = { ...plotPoints[index], order: index + 1 };
			plotPoints[index] = { ...temp, order: index };
			plotPoints = [...plotPoints];
		}
	}
</script>

<div class="space-y-4">
	{#each plotPoints as plotPoint, index}
		<div class="card bg-base-200 shadow-xl">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<h3 class="card-title">Plot Point {index + 1}</h3>
					<div class="flex gap-2">
						<button
							class="btn btn-sm"
							disabled={index === 0}
							on:click={() => movePlotPoint(index, 'up')}
						>
							↑
						</button>
						<button
							class="btn btn-sm"
							disabled={index === plotPoints.length - 1}
							on:click={() => movePlotPoint(index, 'down')}
						>
							↓
						</button>
						<button class="btn btn-error btn-sm" on:click={() => removePlotPoint(index)}>
							×
						</button>
					</div>
				</div>

				<div class="grid gap-4">
					<FormField
						schema={plotSchema}
						path={`plotPoints.${index}.title`}
						label="Title"
						bind:value={plotPoint.title}
					/>

					<FormField
						schema={plotSchema}
						path={`plotPoints.${index}.description`}
						label="Description"
						type="textarea"
						bind:value={plotPoint.description}
					/>

					<div class="grid gap-4 md:grid-cols-2">
						<EnumField
							schema={plotSchema}
							path={`plotPoints.${index}.detailLevel`}
							label="Detail Level"
							bind:value={plotPoint.detailLevel}
							options={detailLevelOptions}
						/>

						<FormField
							schema={plotSchema}
							path={`plotPoints.${index}.duration`}
							label="Duration"
							bind:value={plotPoint.duration}
						/>
					</div>

					<FormField
						schema={plotSchema}
						path={`plotPoints.${index}.timestamp`}
						label="Timestamp"
						type="datetime-local"
						bind:value={plotPoint.timestamp}
					/>

					<div class="grid gap-4 md:grid-cols-2">
						<FormField
							schema={plotSchema}
							path={`plotPoints.${index}.location.primary`}
							label="Primary Location"
							bind:value={plotPoint.location.primary}
						/>

						<ArrayField
							schema={plotSchema}
							path={`plotPoints.${index}.location.mentioned`}
							label="Mentioned Locations"
							bind:value={plotPoint.location.mentioned}
							placeholder="Location IDs (comma-separated)"
						/>
					</div>

					<div class="divider">Characters</div>

					{#each plotPoint.characters as character, charIndex}
						<div class="grid gap-4 md:grid-cols-3">
							<FormField
								schema={plotSchema}
								path={`plotPoints.${index}.characters.${charIndex}.characterId`}
								label="Character"
								bind:value={character.characterId}
							/>

							<EnumField
								schema={plotSchema}
								path={`plotPoints.${index}.characters.${charIndex}.role`}
								label="Role"
								bind:value={character.role}
								options={characterRoleOptions}
							/>

							<ArrayField
								schema={plotSchema}
								path={`plotPoints.${index}.characters.${charIndex}.actions`}
								label="Actions"
								bind:value={character.actions}
								placeholder="Character actions (comma-separated)"
							/>
						</div>
					{/each}

					<button
						class="btn btn-secondary"
						on:click={() =>
							(plotPoint.characters = [
								...(plotPoint.characters || []),
								{
									characterId: '',
									role: 'active',
									actions: []
								}
							])}
					>
						Add Character
					</button>
				</div>
			</div>
		</div>
	{/each}

	<button class="btn btn-primary w-full" on:click={addPlotPoint}> Add Plot Point </button>
</div>
