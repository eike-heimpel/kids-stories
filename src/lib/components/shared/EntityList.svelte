<script lang="ts">
	import type { BaseDocument } from '$lib/server/mongodb/types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import UniverseCreateModal from '../universe/UniverseCreateModal.svelte';

	interface ListItem extends BaseDocument {
		name?: string;
		title?: string;
	}

	export let items: ListItem[] = [];
	export let title: string;
	export let entityType: string;

	// Get the current base path
	$: basePath = entityType === 'universe' ? '/private/universes' : $page.url.pathname;

	// Placeholder search function
	let searchQuery = '';
	$: filteredItems = items.filter((item) =>
		(item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
	);

	let showCreateModal = false;

	function handleCreate() {
		if (entityType === 'universe') {
			showCreateModal = true;
		} else {
			// Preserve existing URL parameters when navigating
			const params = new URLSearchParams($page.url.searchParams);
			goto(`${basePath}/new?${params.toString()}`);
		}
	}

	function handleCreateSubmit(data: { name: string; language: string }) {
		// Navigate to the new universe page with query parameters
		const params = new URLSearchParams({ name: data.name, language: data.language });
		goto(`${basePath}/new?${params.toString()}`);
	}

	function handleEdit(id: string) {
		goto(`${basePath}/${id}/edit`);
	}

	function handleView(id: string) {
		goto(`${basePath}/${id}`);
	}

	// Placeholder delete function
	function handleDelete(id: string) {
		console.log('Delete:', id);
		// Will be implemented with actual API call later
	}
</script>

<div class="p-4">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-bold">{title}</h1>
		<button class="btn btn-primary" on:click={handleCreate}> Create New </button>
	</div>

	<div class="form-control mb-4 w-full max-w-xs">
		<input
			type="text"
			placeholder="Search..."
			class="input input-bordered w-full"
			bind:value={searchQuery}
		/>
	</div>

	<div class="overflow-x-auto">
		<table class="table w-full">
			<thead>
				<tr>
					<th>Name</th>
					<th>Created</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredItems as item}
					<tr>
						<td>{item.name || item.title}</td>
						<td>{new Date(item.createdAt).toLocaleDateString()}</td>
						<td class="flex gap-2">
							<button
								class="btn btn-ghost btn-sm"
								on:click={() => handleView(item._id?.toString() || '')}
							>
								View
							</button>
							<button
								class="btn btn-ghost btn-sm"
								on:click={() => handleEdit(item._id?.toString() || '')}
							>
								Edit
							</button>
							<button
								class="btn btn-error btn-sm"
								on:click={() => handleDelete(item._id?.toString() || '')}
							>
								Delete
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

{#if entityType === 'universe'}
	<UniverseCreateModal
		bind:show={showCreateModal}
		onClose={() => (showCreateModal = false)}
		onSubmit={handleCreateSubmit}
	/>
{/if}
