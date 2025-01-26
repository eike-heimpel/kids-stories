<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import EntityDetail from '$lib/components/shared/EntityDetail.svelte';

	export let data: PageData;
	const { plot } = data;

	function handleEdit() {
		goto(`/private/universes/${data.universe._id}/plots/${plot._id}/edit`);
	}
</script>

<EntityDetail entity={plot} entityType="plot" id={plot._id} onEdit={handleEdit}>
	<div class="grid gap-6">
		<section>
			<h3 class="mb-2 text-xl font-bold">Summary</h3>
			<p class="whitespace-pre-wrap">{plot.summary}</p>
		</section>

		<section>
			<h3 class="mb-2 text-xl font-bold">Status</h3>
			<span class="badge badge-primary">{plot.status}</span>
		</section>

		{#if plot.timeframe}
			<section>
				<h3 class="mb-2 text-xl font-bold">Timeframe</h3>
				<div class="grid gap-2">
					<div>
						<strong>Start:</strong>
						{new Date(plot.timeframe.start).toLocaleDateString()}
					</div>
					{#if plot.timeframe.end}
						<div>
							<strong>End:</strong>
							{new Date(plot.timeframe.end).toLocaleDateString()}
						</div>
					{/if}
					{#if plot.timeframe.duration}
						<div>
							<strong>Duration:</strong>
							{plot.timeframe.duration}
						</div>
					{/if}
				</div>
			</section>
		{/if}

		{#if plot.mainCharacters?.length}
			<section>
				<h3 class="mb-2 text-xl font-bold">Main Characters</h3>
				<div class="flex flex-wrap gap-2">
					{#each plot.mainCharacters as characterId}
						<span class="badge">{characterId}</span>
					{/each}
				</div>
			</section>
		{/if}

		{#if plot.plotPoints?.length}
			<section>
				<h3 class="mb-2 text-xl font-bold">Plot Points</h3>
				<div class="space-y-4">
					{#each plot.plotPoints as point}
						<div class="card bg-base-200">
							<div class="card-body">
								<h4 class="card-title">{point.title}</h4>
								<p>{point.description}</p>
								<div class="mt-2 flex flex-wrap gap-2">
									<span class="badge badge-outline">{point.detailLevel}</span>
									{#if point.mood}
										<span class="badge badge-ghost">{point.mood}</span>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		{#if plot.tags?.length}
			<section>
				<h3 class="mb-2 text-xl font-bold">Tags</h3>
				<div class="flex flex-wrap gap-2">
					{#each plot.tags as tag}
						<span class="badge badge-outline">{tag}</span>
					{/each}
				</div>
			</section>
		{/if}

		<div class="divider">LLM Context</div>

		<section>
			<h3 class="mb-2 text-xl font-bold">AI/LLM Context</h3>
			<div class="grid gap-4">
				{#if plot.llmContext.shortDescription}
					<div>
						<strong>Short Description:</strong>
						<p class="mt-1">{plot.llmContext.shortDescription}</p>
					</div>
				{/if}
				{#if plot.llmContext.keyPoints?.length}
					<div>
						<strong>Key Points:</strong>
						<ul class="mt-1 list-inside list-disc">
							{#each plot.llmContext.keyPoints as point}
								<li>{point}</li>
							{/each}
						</ul>
					</div>
				{/if}
				{#if plot.llmContext.relationships}
					<div>
						<strong>Relationships:</strong>
						<p class="mt-1 whitespace-pre-wrap">{plot.llmContext.relationships}</p>
					</div>
				{/if}
				{#if plot.llmContext.hiddenInformation}
					<div>
						<strong>Hidden Information:</strong>
						<p class="mt-1 whitespace-pre-wrap">{plot.llmContext.hiddenInformation}</p>
					</div>
				{/if}
				{#if plot.llmContext.storyImplications}
					<div>
						<strong>Story Implications:</strong>
						<p class="mt-1 whitespace-pre-wrap">{plot.llmContext.storyImplications}</p>
					</div>
				{/if}
				{#if plot.llmContext.tone}
					<div>
						<strong>Tone:</strong>
						<p class="mt-1">{plot.llmContext.tone}</p>
					</div>
				{/if}
				{#if plot.llmContext.systemNotes}
					<div>
						<strong>System Notes:</strong>
						<p class="mt-1 whitespace-pre-wrap">{plot.llmContext.systemNotes}</p>
					</div>
				{/if}
			</div>
		</section>
	</div>
</EntityDetail>
