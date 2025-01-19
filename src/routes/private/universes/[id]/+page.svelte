<script lang="ts">
	import type { Universe } from '$lib/server/mongodb/types';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import EntityDetail from '$lib/components/shared/EntityDetail.svelte';

	let universe: Universe | null = null;
	let error: string | null = null;
	let loading = true;

	async function loadUniverse() {
		try {
			const response = await fetch(`/api/universes/${$page.params.id}`);
			if (!response.ok) {
				throw new Error((await response.text()) || 'Failed to load universe');
			}
			universe = await response.json();
		} catch (e) {
			console.error('Error loading universe:', e);
			error = e instanceof Error ? e.message : 'Failed to load universe';
		} finally {
			loading = false;
		}
	}

	onMount(loadUniverse);
</script>

<EntityDetail {loading} {error} entity={universe} entityType="universe" id={$page.params.id}>
	{#if universe}
		<div class="grid gap-6">
			<section>
				<h3 class="mb-2 text-xl font-bold">Description</h3>
				<p class="whitespace-pre-wrap">{universe.description}</p>
			</section>

			{#if universe.genre?.length || universe.tags?.length}
				<section class="flex gap-4">
					{#if universe.genre?.length}
						<div>
							<h3 class="mb-2 text-xl font-bold">Genres</h3>
							<div class="flex flex-wrap gap-2">
								{#each universe.genre as genre}
									<span class="badge badge-primary">{genre}</span>
								{/each}
							</div>
						</div>
					{/if}

					{#if universe.tags?.length}
						<div>
							<h3 class="mb-2 text-xl font-bold">Tags</h3>
							<div class="flex flex-wrap gap-2">
								{#each universe.tags as tag}
									<span class="badge">{tag}</span>
								{/each}
							</div>
						</div>
					{/if}
				</section>
			{/if}

			{#if universe.targetAgeRange}
				<section>
					<h3 class="mb-2 text-xl font-bold">Target Age Range</h3>
					<p>{universe.targetAgeRange.min} - {universe.targetAgeRange.max} years</p>
				</section>
			{/if}

			<div class="divider">LLM Context</div>

			<section class="grid gap-4">
				{#if universe.llmContext.shortDescription}
					<div>
						<h3 class="text-lg font-bold">Short Description</h3>
						<p>{universe.llmContext.shortDescription}</p>
					</div>
				{/if}

				{#if universe.llmContext.longDescription}
					<div>
						<h3 class="text-lg font-bold">Long Description</h3>
						<p class="whitespace-pre-wrap">{universe.llmContext.longDescription}</p>
					</div>
				{/if}

				{#if universe.llmContext.keyPoints?.length}
					<div>
						<h3 class="text-lg font-bold">Key Points</h3>
						<ul class="list-inside list-disc">
							{#each universe.llmContext.keyPoints as point}
								<li>{point}</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if universe.llmContext.relationships}
					<div>
						<h3 class="text-lg font-bold">Relationships</h3>
						<p class="whitespace-pre-wrap">{universe.llmContext.relationships}</p>
					</div>
				{/if}

				{#if universe.llmContext.hiddenInformation}
					<div>
						<h3 class="text-lg font-bold">Hidden Information</h3>
						<p class="whitespace-pre-wrap">{universe.llmContext.hiddenInformation}</p>
					</div>
				{/if}

				{#if universe.llmContext.storyImplications}
					<div>
						<h3 class="text-lg font-bold">Story Implications</h3>
						<p class="whitespace-pre-wrap">{universe.llmContext.storyImplications}</p>
					</div>
				{/if}

				{#if universe.llmContext.tone}
					<div>
						<h3 class="text-lg font-bold">Tone</h3>
						<p>{universe.llmContext.tone}</p>
					</div>
				{/if}

				{#if universe.llmContext.systemNotes}
					<div>
						<h3 class="text-lg font-bold">System Notes</h3>
						<p class="whitespace-pre-wrap">{universe.llmContext.systemNotes}</p>
					</div>
				{/if}
			</section>
		</div>
	{/if}
</EntityDetail>
