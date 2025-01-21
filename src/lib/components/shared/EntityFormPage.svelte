<script lang="ts">
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/components/toastStore';
	import type { BaseDocument } from '$lib/server/mongodb/types';
	import type { ObjectId } from 'mongodb';

	// Base interface for any entity
	interface EntityInfo {
		_id?: string | ObjectId;
		name?: string;
		[key: string]: any;
	}

	interface ParentInfo {
		_id: string;
		name: string;
	}

	export let entity: EntityInfo;
	export let entityType: 'universe' | 'character' | 'plot' | 'location' | 'event';
	export let parent: ParentInfo | null = null; // For nested entities like characters in a universe
	export let basePath: string; // The base API path for this entity type
	export let returnPath: string; // Where to return on cancel/after save
	export let layoutBasePath: string = basePath; // The base path for the layout (for invalidation)

	const isEdit = !!entity._id;

	async function handleSubmit(entityData: EntityInfo) {
		try {
			const endpoint = isEdit ? `${basePath}/${entity._id}` : basePath;

			const response = await fetch(endpoint, {
				method: isEdit ? 'PUT' : 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(entityData)
			});

			if (!response.ok) {
				throw new Error(await response.text());
			}

			const savedEntity = await response.json();
			const entityId = savedEntity._id?.toString() || savedEntity._id;

			// Show success message
			addToast(`${entityType} ${isEdit ? 'updated' : 'created'} successfully`, 'success');

			// Invalidate both the parent route and the layout data
			if (parent) {
				invalidateAll();
				await Promise.all([invalidate(returnPath), invalidate(layoutBasePath)]);
			}

			// Navigate to the entity detail view
			await goto(`${basePath}/${entityId}`);
		} catch (e) {
			console.error(`Error ${isEdit ? 'updating' : 'creating'} ${entityType}:`, e);
			addToast(
				e instanceof Error ? e.message : `Failed to ${isEdit ? 'update' : 'create'} ${entityType}`,
				'error'
			);
		}
	}

	function handleCancel() {
		const path = isEdit ? `${basePath}/${entity._id}` : returnPath;
		goto(path);
	}
</script>

<div class="container mx-auto max-w-4xl p-4">
	<slot {handleSubmit} {handleCancel} />
</div>
