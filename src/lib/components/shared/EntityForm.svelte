<script lang="ts">
	import type { EntityWithCommon } from '$lib/types/forms';
	import AIAssistModal from './AIAssistModal.svelte';

	export let entity: EntityWithCommon;
	export let entityType: 'universe' | 'character' | 'plot' | 'location' | 'event';
	export let onSubmit: <T extends EntityWithCommon>(data: T) => void;
	export let onCancel: () => void;
	export let quickAdjustOptions: Array<{ id: string; label: string }> = [];

	let isSubmitting = false;
	let showAIAssist = false;

	// Handle form submission
	async function handleSubmit() {
		isSubmitting = true;
		try {
			await onSubmit(entity);
		} catch (error) {
			console.error(`Error submitting ${entityType}:`, error);
		} finally {
			isSubmitting = false;
		}
	}

	// Deep merge function for objects
	function deepMerge(target: any, source: any) {
		if (!source) return target;
		if (!target) return source;

		const result = { ...target };
		for (const key of Object.keys(source)) {
			if (Array.isArray(source[key])) {
				// For arrays, replace the entire array
				result[key] = [...source[key]];
			} else if (source[key] instanceof Object && target[key] instanceof Object) {
				// For nested objects, recursively merge
				result[key] = deepMerge(target[key], source[key]);
			} else {
				// For primitives or when target doesn't have the key, use source value
				result[key] = source[key];
			}
		}
		return result;
	}

	// Handle AI assist changes
	function handleAIChanges(changes: Record<string, any>) {
		console.log('Applying changes:', changes); // Debug log

		// Create a copy of the current entity
		let updatedEntity = { ...entity };

		// Update each changed field
		for (const [key, value] of Object.entries(changes)) {
			if (value instanceof Object && !Array.isArray(value)) {
				// For objects (like llmContext), do a deep merge
				updatedEntity[key] = deepMerge(entity[key] || {}, value);
			} else {
				// For arrays and primitive values, replace directly
				updatedEntity[key] = value;
			}
		}

		console.log('Updated entity:', updatedEntity); // Debug log

		// Update the entity with all changes at once
		Object.assign(entity, updatedEntity);

		// Emit the changes for entity-specific handling
		dispatchEvent(new CustomEvent('aichanges', { detail: changes }));
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6 p-4">
	<div class="flex justify-end gap-4">
		<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
			Save {entityType}
		</button>
		<button
			type="button"
			class="btn btn-outline btn-primary gap-2"
			on:click={() => (showAIAssist = true)}
			disabled={isSubmitting}
		>
			AI Assist
		</button>
	</div>

	<!-- Common Fields -->
	<div class="form-control">
		<label class="label" for="name">
			<span class="label-text">{entityType} Name</span>
		</label>
		<input type="text" id="name" class="input input-bordered" bind:value={entity.name} />
	</div>

	<!-- Slot for entity-specific fields -->
	<slot />

	<!-- Common metadata fields -->
	{#if 'isPublic' in entity}
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text">Public {entityType}</span>
				<input type="checkbox" class="toggle" bind:checked={entity.isPublic} />
			</label>
		</div>
	{/if}

	<div class="flex justify-end gap-4">
		<button type="button" class="btn btn-ghost" on:click={onCancel} disabled={isSubmitting}>
			Cancel
		</button>
		<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
			{isSubmitting ? 'Saving...' : `Save ${entityType}`}
		</button>
	</div>
</form>

<AIAssistModal
	bind:show={showAIAssist}
	currentContext={entity.llmContext}
	{entityType}
	onClose={() => (showAIAssist = false)}
	onApply={handleAIChanges}
	currentData={entity}
	universeId={entity._id?.toString()}
	{quickAdjustOptions}
/>
