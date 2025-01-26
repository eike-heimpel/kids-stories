<script lang="ts">
	import type { BaseDocument } from '$lib/server/mongodb/types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';
	import UniverseCreateModal from '../universe/UniverseCreateModal.svelte';
	import type { Universe } from '$lib/server/mongodb/types';
	import { addToast } from '$lib/components/toastStore';

	interface ListItem extends BaseDocument {
		name?: string;
		title?: string;
	}

	export let items: ListItem[] = [];
	export let entityType: 'universe' | 'character' | 'plot' = 'universe';
	export let showCreateButton = true;

	// Get the current base path
	$: basePath = entityType === 'universe' ? '/private/universes' : $page.url.pathname;

	// Get the API base path
	$: apiPath = entityType === 'universe' ? '/api/universes' : $page.url.pathname;

	// Placeholder search function
	let searchQuery = '';
	$: filteredItems = items.filter((item) =>
		(item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
	);

	let showCreateModal = false;
	let showDeleteModal = false;
	let itemToDelete: ListItem | null = null;

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

	function confirmDelete(item: ListItem) {
		itemToDelete = item;
		showDeleteModal = true;
	}

	async function handleDelete() {
		if (!itemToDelete?._id) return;
		const id = itemToDelete._id;

		try {
			console.log(apiPath);
			const response = await fetch(`${apiPath}/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete item');
			}

			// Show success message and update local state
			addToast('Item deleted successfully', 'success');
			items = items.filter((item) => item._id !== id);

			// Trigger data refresh in the background
			invalidate(apiPath);
		} catch (error) {
			console.error('Error deleting item:', error);
			addToast('Failed to delete item', 'error');
		} finally {
			showDeleteModal = false;
			itemToDelete = null;
		}
	}
</script>

<div class="p-4">
	<div class="mb-4 flex items-center justify-between"></div>

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
								class="btn btn-outline btn-sm"
								on:click={() => handleView(item._id?.toString() || '')}
							>
								View
							</button>
							<button
								class="btn btn-primary btn-sm"
								on:click={() => handleEdit(item._id?.toString() || '')}
							>
								Edit
							</button>
							<button class="btn btn-outline btn-error btn-sm" on:click={() => confirmDelete(item)}>
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

{#if showDeleteModal}
	<div class="modal modal-open">
		<div class="modal-box">
			<h3 class="text-lg font-bold">Confirm Delete</h3>
			<p class="py-4">
				Are you sure you want to delete "{itemToDelete?.name ||
					itemToDelete?.title ||
					'this item'}"? This action cannot be undone.
			</p>
			<div class="modal-action">
				<button class="btn btn-ghost" on:click={() => (showDeleteModal = false)}>Cancel</button>
				<button class="btn btn-error" on:click={handleDelete}>Delete</button>
			</div>
		</div>
	</div>
{/if}
