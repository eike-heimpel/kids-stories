<script lang="ts">
	import type { BaseDocument, LLMContext } from '$lib/server/mongodb/types';
	import AIAssistModal from './AIAssistModal.svelte';

	interface EntityWithTitle extends BaseDocument {
		name?: string;
		title?: string;
		isPublic?: boolean;
		llmContext: LLMContext;
	}

	export let entity: EntityWithTitle;
	export let entityType: 'universe' | 'character' | 'plot' | 'location' | 'event';
	export let onSubmit: (data: typeof entity) => void;
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

	// Handle AI assist changes
	function handleAIChanges(changes: Record<string, any>) {
		// Update llmContext if present in changes
		if (changes.llmContext) {
			// Replace the entire llmContext object instead of merging
			entity.llmContext = changes.llmContext as LLMContext;
		}

		// Update any other entity fields that might have changed
		for (const [key, value] of Object.entries(changes)) {
			if (key !== 'llmContext' && key in entity) {
				// Only update if the key exists in the entity and matches its type
				const entityKey = key as keyof EntityWithTitle;
				if (typeof value === typeof entity[entityKey]) {
					(entity[entityKey] as any) = value;
				}
			}
		}

		// Emit the changes for entity-specific handling
		dispatchEvent(new CustomEvent('aichanges', { detail: changes }));
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6 p-4">
	<div class="flex justify-end gap-4">
		<button type="button" class="btn btn-primary" on:click={handleSubmit} disabled={isSubmitting}>
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
		<input type="text" id="name" class="input input-bordered" bind:value={entity.name} required />
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
