<script lang="ts">
	import type { Universe } from '$lib/server/mongodb/types';
	import LLMContextForm from '../shared/LLMContextForm.svelte';
	import AIAssistModal from '../shared/AIAssistModal.svelte';

	export let universe: Universe;
	export let onSubmit: (data: Universe) => void;
	export let onCancel: () => void;

	let isSubmitting = false;
	let showAIAssist = false;

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

	// Handle form submission
	async function handleSubmit() {
		isSubmitting = true;
		try {
			await onSubmit(universe);
		} catch (error) {
			console.error('Error submitting universe:', error);
		} finally {
			isSubmitting = false;
		}
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
	function handleAIChanges(changes: Partial<typeof universe.llmContext>) {
		universe.llmContext = {
			...universe.llmContext,
			...changes
		};
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6 p-4">
	<div class="flex justify-end">
		<button
			type="button"
			class="btn btn-outline btn-primary gap-2"
			on:click={() => (showAIAssist = true)}
			disabled={isSubmitting}
		>
			<span class="text-xl">✨</span>
			AI Assist
		</button>
	</div>

	<div class="form-control">
		<label class="label" for="name">
			<span class="label-text">Universe Name</span>
		</label>
		<input type="text" id="name" class="input input-bordered" bind:value={universe.name} required />
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
		<label class="label cursor-pointer">
			<span class="label-text">Public Universe</span>
			<input type="checkbox" class="toggle" bind:checked={universe.isPublic} />
		</label>
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

	<LLMContextForm bind:context={universe.llmContext} disabled={isSubmitting} />

	<div class="flex justify-end gap-4">
		<button type="button" class="btn btn-ghost" on:click={onCancel} disabled={isSubmitting}>
			Cancel
		</button>
		<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
			{isSubmitting ? 'Saving...' : 'Save Universe'}
		</button>
	</div>
</form>

<AIAssistModal
	bind:show={showAIAssist}
	currentContext={universe.llmContext}
	onClose={() => (showAIAssist = false)}
	onApply={handleAIChanges}
	quickAdjustOptions={universeQuickAdjustOptions}
/>
