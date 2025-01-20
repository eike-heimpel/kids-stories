<script lang="ts">
	import { onMount } from 'svelte';
	import type { Universe } from '$lib/server/mongodb/types';
	import EntityList from '$lib/components/shared/EntityList.svelte';
	import UniverseCreateModal from '$lib/components/universe/UniverseCreateModal.svelte';
	import { goto } from '$app/navigation';

	let universes: Universe[] = [];
	let loading = true;
	let error: string | null = null;
	let showCreateModal = false;

	onMount(async () => {
		try {
			const response = await fetch('/api/universes');
			if (!response.ok) {
				throw new Error('Failed to load universes');
			}
			const data = await response.json();
			universes = data.items;
		} catch (e) {
			console.error('Error loading universes:', e);
			error = 'Failed to load universes';
		} finally {
			loading = false;
		}
	});

	function handleCreate() {
		showCreateModal = true;
	}

	function handleCreateSubmit(data: { name: string; language: string }) {
		const params = new URLSearchParams({ name: data.name, language: data.language });
		goto(`/private/universes/new?${params.toString()}`);
	}
</script>

<div class="container mx-auto">
	{#if loading}
		<div class="flex items-center justify-center p-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if error}
		<div class="alert alert-error">
			<span class="material-icons">error</span>
			<span>{error}</span>
		</div>
	{:else}
		<div class="p-4">
			<div class="mb-8">
				<h1 class="text-3xl font-bold">Story Builder Dashboard</h1>
				<p class="mt-2 text-base-content/70">
					Select a universe to begin, or create a new one to start your journey.
				</p>
			</div>

			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-2xl font-bold">Your Story Universes</h2>
				<button class="btn btn-primary" on:click={handleCreate}>Create New Universe</button>
			</div>

			<EntityList
				items={universes}
				title="Story Universes"
				entityType="universe"
				showCreateButton={false}
			/>
		</div>

		<div class="mt-12 rounded-box bg-base-200 p-6">
			<h2 class="mb-4 text-2xl font-bold">Quick Start Guide</h2>
			<div class="steps steps-vertical">
				<div class="step step-primary">Create a new Universe to define your story world</div>
				<div class="step">Add Characters to populate your universe</div>
				<div class="step">Define Locations where your story takes place</div>
				<div class="step">Create Plots and Story Arcs to bring your narrative to life</div>
			</div>
		</div>
	{/if}
</div>

<UniverseCreateModal
	bind:show={showCreateModal}
	onClose={() => (showCreateModal = false)}
	onSubmit={handleCreateSubmit}
/>
