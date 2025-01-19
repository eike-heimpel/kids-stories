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
		lastModifiedBy: '', // Will be set by the server
		llmContext: {
			shortDescription: ''
		},
		creatorId: '', // Will be set by the server
		isPublic: false
	};

	let error: string | null = null;
	let loading = false;

	async function handleSubmit(universe: Universe) {
		loading = true;
		error = null;

		try {
			const response = await fetch('/api/universes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(universe)
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || 'Failed to create universe');
			}

			await goto('/private/universes');
		} catch (e) {
			console.error('Error creating universe:', e);
			error = e instanceof Error ? e.message : 'Failed to create universe';
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		goto('/private/universes');
	}
</script>

<div class="container mx-auto max-w-4xl">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Create New Universe</h2>
			{#if error}
				<div class="alert alert-error">
					<span class="material-icons">error</span>
					<span>{error}</span>
				</div>
			{/if}
			<UniverseForm universe={newUniverse} onSubmit={handleSubmit} onCancel={handleCancel} />
		</div>
	</div>
</div>
