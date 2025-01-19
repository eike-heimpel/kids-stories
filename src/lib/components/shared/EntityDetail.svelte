<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { BaseDocument } from '$lib/server/mongodb/types';

	interface EntityWithTitle extends BaseDocument {
		name?: string;
		title?: string;
	}

	export let entity: EntityWithTitle | null = null;
	export let entityType: string;
	export let loading = false;
	export let error: string | null = null;
	export let id: string;

	// Get the base path from the current URL (e.g., /private/universes)
	$: basePath = $page.url.pathname.split('/').slice(0, -1).join('/');

	// Common handlers for navigation
	function handleEdit() {
		goto(`${basePath}/${id}/edit`);
	}

	function handleBack() {
		goto(basePath);
	}
</script>

<div class="container mx-auto max-w-4xl p-4">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			{#if loading}
				<div class="flex items-center justify-center p-8">
					<span class="loading loading-spinner loading-lg" />
				</div>
			{:else if error}
				<div class="alert alert-error">
					<span class="material-icons">error</span>
					<span>{error}</span>
					<button class="btn btn-ghost ml-auto" on:click={handleBack}>Back to List</button>
				</div>
			{:else if entity}
				<div class="mb-6 flex items-center justify-between">
					<h2 class="card-title text-3xl">{entity.name || entity.title}</h2>
					<div class="flex gap-2">
						<button class="btn btn-ghost" on:click={handleBack}>Back to List</button>
						<button class="btn btn-primary" on:click={handleEdit}>Edit {entityType}</button>
					</div>
				</div>

				<slot />

				<div class="divider">Metadata</div>

				<section class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<h3 class="font-bold">Created</h3>
						<p>{new Date(entity.createdAt).toLocaleString()}</p>
					</div>
					<div>
						<h3 class="font-bold">Last Updated</h3>
						<p>{new Date(entity.updatedAt).toLocaleString()}</p>
					</div>
					<div>
						<h3 class="font-bold">Version</h3>
						<p>{entity.version}</p>
					</div>
					{#if 'isPublic' in entity}
						<div>
							<h3 class="font-bold">Visibility</h3>
							<p>{entity.isPublic ? 'Public' : 'Private'}</p>
						</div>
					{/if}
				</section>
			{:else}
				<div class="alert alert-error">
					<span class="material-icons">error</span>
					<span>{entityType} not found</span>
					<button class="btn btn-ghost ml-auto" on:click={handleBack}>Back to List</button>
				</div>
			{/if}
		</div>
	</div>
</div>
