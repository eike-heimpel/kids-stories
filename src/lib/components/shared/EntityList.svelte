<script lang="ts">
	import type { BaseDocument } from '$lib/server/mongodb/types';

	interface ListItem extends BaseDocument {
		name?: string;
		title?: string;
	}

	export let items: ListItem[] = [];
	export let title: string;
	export let entityType: string;

	// Placeholder search function
	let searchQuery = '';
	$: filteredItems = items.filter((item) =>
		(item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
	);

	function handleCreate() {
		window.location.href = `/${entityType}/new`;
	}

	function handleEdit(id: string) {
		window.location.href = `/${entityType}/${id}/edit`;
	}

	function handleView(id: string) {
		window.location.href = `/${entityType}/${id}`;
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
