<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { addToast } from '$lib/components/toastStore';
	import type { BaseDocument } from '$lib/server/mongodb/types';
	import type { ObjectId } from 'mongodb';
	import { enhance } from '$app/forms';

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
			const form = new FormData();
			form.append('data', JSON.stringify(entityData));

			const response = await fetch('?/save', {
				method: 'POST',
				body: form
			});

			if (!response.ok) {
				const text = await response.text();
				throw new Error(text || `Failed to ${isEdit ? 'update' : 'create'} ${entityType}`);
			}

			const result = await response.json();
			if (result.success) {
				// Show success message
				addToast(`${entityType} ${isEdit ? 'updated' : 'created'} successfully`, 'success');

				// Invalidate both the parent route and the layout data
				if (parent) {
					await Promise.all([invalidate(returnPath), invalidate(layoutBasePath)]);
				}

				// Navigate to the entity detail view
				const entityId = result[entityType]._id;
				await goto(`${basePath}/${entityId}`);
			} else {
				// Use the error message from the response if available
				throw new Error(result.error || `Failed to ${isEdit ? 'update' : 'create'} ${entityType}`);
			}
		} catch (e) {
			console.error(`Error ${isEdit ? 'updating' : 'creating'} ${entityType}:`, e);
			addToast(
				e instanceof Error ? e.message : `Failed to ${isEdit ? 'update' : 'create'} ${entityType}`,
				'error'
			);
			throw e; // Re-throw to prevent form from resetting
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
