<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import type { Plot } from '$lib/schemas/plot';
	import PlotFormPage from '$lib/components/plot/PlotFormPage.svelte';

	export let data: PageData;
	$: plots = data.plots.items;

	function handleNewPlot() {
		goto(`/private/universes/${data.universe._id}/plots/new`);
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString();
	}
</script>

<div class="container mx-auto p-4">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Plots</h1>
		<button class="btn btn-primary" on:click={handleNewPlot}> New Plot </button>
	</div>

	{#if plots.length === 0}
		<div class="py-8 text-center">
			<p class="text-lg text-gray-600">No plots yet. Create your first plot!</p>
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each plots as plot (plot._id)}
				<div class="card bg-base-200 shadow-xl">
					<div class="card-body">
						<h2 class="card-title">{plot.title}</h2>
						<p class="text-sm text-gray-600">
							{plot.summary.substring(0, 100)}...
						</p>
						<div class="mt-2 flex flex-wrap gap-2">
							<span class="badge badge-primary">{plot.status}</span>
							{#if plot.mainCharacters?.length}
								<span class="badge">
									{plot.mainCharacters.length} Characters
								</span>
							{/if}
							{#if plot.plotPoints?.length}
								<span class="badge">
									{plot.plotPoints.length} Plot Points
								</span>
							{/if}
						</div>
						{#if plot.timeframe}
							<div class="mt-2 text-sm text-gray-600">
								{formatDate(plot.timeframe.start)}
								{#if plot.timeframe.end}
									- {formatDate(plot.timeframe.end)}
								{/if}
							</div>
						{/if}
						<div class="card-actions mt-4 justify-end">
							<a
								href={`/private/universes/${data.universe._id}/plots/${plot._id}`}
								class="btn btn-primary btn-sm"
							>
								View Details
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
