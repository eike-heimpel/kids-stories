<script lang="ts">
	import type { Universe } from '$lib/server/mongodb/types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Placeholder function to fetch universe data
	// This will be replaced with actual API call
	let universe: Universe = {
		_id: $page.params.id as any,
		name: 'Loading...',
		description: 'Loading...',
		createdAt: new Date(),
		updatedAt: new Date(),
		version: 1,
		lastModifiedBy: 'placeholder-user',
		llmContext: {
			shortDescription: 'Loading...'
		},
		creatorId: 'placeholder-user',
		isPublic: false
	};

	// Simulating data fetch
	// This will be replaced with actual API call
	async function loadUniverse() {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Simulate loaded data
		universe = {
			...universe,
			name: 'Sample Universe',
			description: 'This is a sample universe description',
			llmContext: {
				shortDescription: 'A sample universe for testing',
				longDescription: 'More detailed description would go here',
				keyPoints: ['Key point 1', 'Key point 2'],
				relationships: 'Related to other universes...',
				hiddenInformation: 'Secret lore...',
				storyImplications: 'Impact on stories...',
				tone: 'Mysterious and adventurous',
				systemNotes: 'System-specific details...'
			},
			genre: ['Fantasy', 'Adventure'],
			tags: ['sample', 'test'],
			targetAgeRange: {
				min: 12,
				max: 18
			}
		};
	}

	// Load data when component mounts
	loadUniverse();

	function handleEdit() {
		goto(`/private/universes/${$page.params.id}/edit`);
	}

	function handleBack() {
		goto('/private/universes');
	}
</script>

<div class="container mx-auto max-w-4xl p-4">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="card-title text-3xl">{universe.name}</h2>
				<div class="flex gap-2">
					<button class="btn btn-ghost" on:click={handleBack}> Back to List </button>
					<button class="btn btn-primary" on:click={handleEdit}> Edit Universe </button>
				</div>
			</div>

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

				<div class="divider">Metadata</div>

				<section class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<h3 class="font-bold">Created</h3>
						<p>{new Date(universe.createdAt).toLocaleString()}</p>
					</div>
					<div>
						<h3 class="font-bold">Last Updated</h3>
						<p>{new Date(universe.updatedAt).toLocaleString()}</p>
					</div>
					<div>
						<h3 class="font-bold">Version</h3>
						<p>{universe.version}</p>
					</div>
					<div>
						<h3 class="font-bold">Visibility</h3>
						<p>{universe.isPublic ? 'Public' : 'Private'}</p>
					</div>
				</section>
			</div>
		</div>
	</div>
</div>
