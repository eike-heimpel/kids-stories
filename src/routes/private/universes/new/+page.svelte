<script lang="ts">
	import type { Universe } from '$lib/server/mongodb/types';
	import UniverseForm from '$lib/components/universe/UniverseForm.svelte';
	import { goto } from '$app/navigation';

	// Initialize empty universe
	const newUniverse: Universe = {
		name: '',
		description: '',
		createdAt: new Date(),
		updatedAt: new Date(),
		version: 1,
		lastModifiedBy: 'placeholder-user', // Will be replaced with actual user ID
		llmContext: {
			shortDescription: ''
		},
		creatorId: 'placeholder-user', // Will be replaced with actual user ID
		isPublic: false
	};

	// Placeholder submit function
	async function handleSubmit(universe: Universe) {
		console.log('Creating universe:', universe);
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
			<h2 class="card-title">Create New Universe</h2>
			<UniverseForm universe={newUniverse} onSubmit={handleSubmit} onCancel={handleCancel} />
		</div>
	</div>
</div>
