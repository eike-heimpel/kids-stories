<script lang="ts">
	import type { Character } from '$lib/server/mongodb/types';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import EntityDetail from '$lib/components/shared/EntityDetail.svelte';

	let character: Character | null = null;
	let error: string | null = null;
	let loading = true;

	async function loadCharacter() {
		try {
			const response = await fetch(`/api/characters/${$page.params.id}`);
			if (!response.ok) {
				throw new Error((await response.text()) || 'Failed to load character');
			}
			character = await response.json();
		} catch (e) {
			console.error('Error loading character:', e);
			error = e instanceof Error ? e.message : 'Failed to load character';
		} finally {
			loading = false;
		}
	}

	onMount(loadCharacter);
</script>

<EntityDetail {loading} {error} entity={character} entityType="character" id={$page.params.id}>
	{#if character}
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

			<section class="grid gap-4 md:grid-cols-2">
				<div>
					<h3 class="mb-2 text-xl font-bold">Status</h3>
					<p class="capitalize">{character.status || 'Unknown'}</p>
				</div>

				<div>
					<h3 class="mb-2 text-xl font-bold">Role</h3>
					<p>{character.mainCharacter ? 'Main Character' : 'Supporting Character'}</p>
				</div>

				{#if character.species}
					<div>
						<h3 class="mb-2 text-xl font-bold">Species</h3>
						<p>{character.species}</p>
					</div>
				{/if}

				{#if character.age !== undefined}
					<div>
						<h3 class="mb-2 text-xl font-bold">Age</h3>
						<p>{character.age} years</p>
					</div>
				{/if}
			</section>

			{#if character.traits?.length || character.abilities?.length || character.tags?.length}
				<section class="grid gap-4 md:grid-cols-3">
					{#if character.traits?.length}
						<div>
							<h3 class="mb-2 text-xl font-bold">Traits</h3>
							<div class="flex flex-wrap gap-2">
								{#each character.traits as trait}
									<span class="badge badge-primary">{trait}</span>
								{/each}
							</div>
						</div>
					{/if}

					{#if character.abilities?.length}
						<div>
							<h3 class="mb-2 text-xl font-bold">Abilities</h3>
							<div class="flex flex-wrap gap-2">
								{#each character.abilities as ability}
									<span class="badge badge-secondary">{ability}</span>
								{/each}
							</div>
						</div>
					{/if}

					{#if character.tags?.length}
						<div>
							<h3 class="mb-2 text-xl font-bold">Tags</h3>
							<div class="flex flex-wrap gap-2">
								{#each character.tags as tag}
									<span class="badge">{tag}</span>
								{/each}
							</div>
						</div>
					{/if}
				</section>
			{/if}

			{#if character.relationships?.length}
				<section>
					<h3 class="mb-2 text-xl font-bold">Relationships</h3>
					<div class="grid gap-4 md:grid-cols-2">
						{#each character.relationships as relationship}
							<div class="card bg-base-200">
								<div class="card-body">
									<h4 class="card-title capitalize">{relationship.relationshipType}</h4>
									<p>{relationship.description}</p>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

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

				{#if character.llmContext.relationships}
					<div>
						<h3 class="text-lg font-bold">Relationship Context</h3>
						<p class="whitespace-pre-wrap">{character.llmContext.relationships}</p>
					</div>
				{/if}

				{#if character.llmContext.storyImplications}
					<div>
						<h3 class="text-lg font-bold">Story Implications</h3>
						<p class="whitespace-pre-wrap">{character.llmContext.storyImplications}</p>
					</div>
				{/if}

				{#if character.llmContext.tone}
					<div>
						<h3 class="text-lg font-bold">Character Tone</h3>
						<p>{character.llmContext.tone}</p>
					</div>
				{/if}
			</section>
		</div>
	{/if}
</EntityDetail>
