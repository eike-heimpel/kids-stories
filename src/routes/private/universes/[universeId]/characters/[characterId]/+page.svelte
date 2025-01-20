<script lang="ts">
	import type { PageData } from './$types';
	import EntityDetail from '$lib/components/shared/EntityDetail.svelte';

	export let data: PageData;
	const { character } = data;
</script>

<EntityDetail entity={character} entityType="character" id={character._id}>
	<div class="grid gap-6">
		<section>
			<h3 class="mb-2 text-xl font-bold">Description</h3>
			<p class="whitespace-pre-wrap">{character.description}</p>
		</section>

		{#if character.backstory}
			<section>
				<h3 class="mb-2 text-xl font-bold">Backstory</h3>
				<p class="whitespace-pre-wrap">{character.backstory}</p>
			</section>
		{/if}

		<div class="grid gap-4 md:grid-cols-2">
			{#if character.traits?.length}
				<section>
					<h3 class="mb-2 text-xl font-bold">Traits</h3>
					<div class="flex flex-wrap gap-2">
						{#each character.traits as trait}
							<span class="badge badge-primary">{trait}</span>
						{/each}
					</div>
				</section>
			{/if}

			{#if character.abilities?.length}
				<section>
					<h3 class="mb-2 text-xl font-bold">Abilities</h3>
					<div class="flex flex-wrap gap-2">
						{#each character.abilities as ability}
							<span class="badge">{ability}</span>
						{/each}
					</div>
				</section>
			{/if}
		</div>

		{#if character.relationships?.length}
			<section>
				<h3 class="mb-2 text-xl font-bold">Relationships</h3>
				<div class="grid gap-4">
					{#each character.relationships as relationship}
						<div class="card bg-base-200">
							<div class="card-body">
								<h4 class="card-title">{relationship.relationshipType}</h4>
								<p>{relationship.description}</p>
								{#if relationship.timeframe}
									<div class="text-sm opacity-70">
										{new Date(relationship.timeframe.start).toLocaleDateString()}
										{#if relationship.timeframe.end}
											- {new Date(relationship.timeframe.end).toLocaleDateString()}
										{/if}
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		{#if character.llmContext}
			<div class="divider">LLM Context</div>

			<section class="grid gap-4">
				{#if character.llmContext.shortDescription}
					<div>
						<h3 class="text-lg font-bold">Short Description</h3>
						<p>{character.llmContext.shortDescription}</p>
					</div>
				{/if}

				{#if character.llmContext.longDescription}
					<div>
						<h3 class="text-lg font-bold">Long Description</h3>
						<p class="whitespace-pre-wrap">{character.llmContext.longDescription}</p>
					</div>
				{/if}

				{#if character.llmContext.keyPoints?.length}
					<div>
						<h3 class="text-lg font-bold">Key Points</h3>
						<ul class="list-inside list-disc">
							{#each character.llmContext.keyPoints as point}
								<li>{point}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</section>
		{/if}
	</div>
</EntityDetail>
