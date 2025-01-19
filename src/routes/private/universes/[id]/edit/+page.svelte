<script lang="ts">
	import type { Universe } from '$lib/server/mongodb/types';
	import UniverseForm from '$lib/components/universe/UniverseForm.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

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

	async function handleSubmit(updatedUniverse: Universe) {
		try {
			const { _id, ...updateData } = updatedUniverse;

			const response = await fetch(`/api/universes/${$page.params.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(updateData)
			});

			if (!response.ok) {
				throw new Error((await response.text()) || 'Failed to update universe');
			}

			await goto('/private/universes');
		} catch (e) {
			console.error('Error updating universe:', e);
			error = e instanceof Error ? e.message : 'Failed to update universe';
		}
	}

	function handleCancel() {
		goto('/private/universes');
	}

	onMount(loadUniverse);
</script>

<div class="container mx-auto max-w-4xl">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Edit Universe</h2>
			{#if loading}
				<div class="flex items-center justify-center p-8">
					<span class="loading loading-spinner loading-lg"></span>
				</div>
			{:else if error}
				<div class="alert alert-error">
					<span class="material-icons">error</span>
					<span>{error}</span>
				</div>
			{:else if universe}
				<UniverseForm {universe} onSubmit={handleSubmit} onCancel={handleCancel} />
			{:else}
				<div class="alert alert-error">
					<span class="material-icons">error</span>
					<span>Universe not found</span>
				</div>
			{/if}
		</div>
	</div>
</div>
