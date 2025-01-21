<script lang="ts">
	import type { Universe } from '$lib/server/mongodb/types';
	import type { EntityWithCommon } from '$lib/types/forms';
	import LLMContextForm from '../shared/LLMContextForm.svelte';
	import EntityForm from '../shared/EntityForm.svelte';
	import { page } from '$app/stores';

	export let universe: Universe;
	export let onSubmit: <T extends EntityWithCommon>(data: T) => void;
	export let onCancel: () => void;

	// Get query parameters if they exist
	$: if ($page?.url?.searchParams) {
		const name = $page.url.searchParams.get('name');
		const language = $page.url.searchParams.get('language');
		if (name && !universe.name) universe.name = name;
		if (language && !universe.language) universe.language = language;
	}

	// Quick adjust options specific to universes
	const universeQuickAdjustOptions = [
		{ id: 'tone-mysterious', label: '🌌 Make it more mysterious' },
		{ id: 'tone-lighthearted', label: '☀️ Make it more lighthearted' },
		{ id: 'complexity-simpler', label: '📚 Simplify the content' },
		{ id: 'complexity-deeper', label: '🎯 Add more depth' },
		{ id: 'genre-fantasy', label: '🐉 Enhance fantasy elements' },
		{ id: 'genre-scifi', label: '🚀 Enhance sci-fi elements' },
		{ id: 'audience-younger', label: '🎈 Adjust for younger audience' },
		{ id: 'audience-older', label: '🎭 Adjust for older audience' }
	];

	// Initialize targetAgeRange if it doesn't exist
	universe.targetAgeRange = universe.targetAgeRange || { min: 0, max: 0 };

	// Local variables for age range
	let minAge = universe.targetAgeRange.min;
	let maxAge = universe.targetAgeRange.max;

	$: {
		universe.targetAgeRange = {
			min: minAge,
			max: maxAge
		};
	}

	// Handle genre input
	let genreInput = universe.genre?.join(', ') || '';
	function updateGenres(input: string) {
		universe.genre = input
			.split(',')
			.map((g) => g.trim())
			.filter(Boolean);
	}

	// Handle tags input
	let tagsInput = universe.tags?.join(', ') || '';
	function updateTags(input: string) {
		universe.tags = input
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);
	}

	// Handle AI assist changes
	function handleAIChanges(event: CustomEvent<Record<string, any>>) {
		const changes = event.detail;

		// Update other universe fields if present
		if (changes.genre) {
			universe.genre = changes.genre;
			genreInput = changes.genre.join(', ');
		}
		if (changes.tags) {
			universe.tags = changes.tags;
			tagsInput = changes.tags.join(', ');
		}
		if (changes.targetAgeRange) {
			universe.targetAgeRange = changes.targetAgeRange;
			minAge = changes.targetAgeRange.min;
			maxAge = changes.targetAgeRange.max;
		}
	}
</script>

<EntityForm
	entity={universe}
	entityType="universe"
	{onSubmit}
	{onCancel}
	quickAdjustOptions={universeQuickAdjustOptions}
	on:aichanges={handleAIChanges}
>
	<div class="form-control">
		<label class="label" for="language">
			<span class="label-text">Language</span>
		</label>

		<input type="text" id="language" class="input input-bordered" bind:value={universe.language} />
	</div>

	<div class="form-control">
		<label class="label" for="description">
			<span class="label-text">Description</span>
		</label>
		<textarea
			id="description"
			class="textarea textarea-bordered"
			bind:value={universe.description}
			required
		/>
	</div>

	<div class="form-control">
		<label class="label" for="genre">
			<span class="label-text">Genres</span>
		</label>
		<input
			type="text"
			id="genre"
			class="input input-bordered"
			bind:value={genreInput}
			on:input={(e) => updateGenres(e.currentTarget.value)}
			placeholder="Fantasy, Science Fiction, etc. (comma-separated)"
		/>
	</div>

	<div class="form-control">
		<label class="label" for="tags">
			<span class="label-text">Tags</span>
		</label>
		<input
			type="text"
			id="tags"
			class="input input-bordered"
			bind:value={tagsInput}
			on:input={(e) => updateTags(e.currentTarget.value)}
			placeholder="magic, technology, etc. (comma-separated)"
		/>
	</div>

	<div class="form-control">
		<label class="label" for="targetAgeRange">
			<span class="label-text">Target Age Range</span>
		</label>
		<div class="flex gap-4">
			<input
				type="number"
				class="input input-bordered w-24"
				bind:value={minAge}
				placeholder="Min"
				min="0"
			/>
			<input
				type="number"
				class="input input-bordered w-24"
				bind:value={maxAge}
				placeholder="Max"
				min="0"
			/>
		</div>
	</div>

	<div class="form-control">
		<label class="label" for="coverImageUrl">
			<span class="label-text">Cover Image URL</span>
		</label>
		<input
			type="url"
			id="coverImageUrl"
			class="input input-bordered"
			bind:value={universe.coverImageUrl}
			placeholder="https://..."
		/>
	</div>

	<div class="divider">LLM Context</div>

	<LLMContextForm bind:context={universe.llmContext} />
</EntityForm>
