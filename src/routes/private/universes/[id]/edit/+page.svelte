<script lang="ts">
	import type { Universe } from '$lib/server/mongodb/types';
	import UniverseForm from '$lib/components/universe/UniverseForm.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Placeholder function to fetch universe data
	// This will be replaced with actual API call
	const dummyUniverse: Universe = {
		_id: $page.params.id as any,
		name: 'Loading...',
		description: 'Loading...',
		createdAt: new Date(),
		updatedAt: new Date(),
		version: 1,
		lastModifiedBy: 'placeholder-user',
		llmContext: {
			shortDescription: ''
		},
		creatorId: 'placeholder-user',
		isPublic: false
	};

	let universe = dummyUniverse;

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

	// Placeholder submit function
	async function handleSubmit(updatedUniverse: Universe) {
		console.log('Updating universe:', updatedUniverse);
		// TODO: Implement actual API call
		await goto('/private/universes');
	}

	function handleCancel() {
		goto('/private/universes');
	}
</script>

<div class="container mx-auto max-w-4xl">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Edit Universe</h2>
			<UniverseForm {universe} onSubmit={handleSubmit} onCancel={handleCancel} />
		</div>
	</div>
</div>
