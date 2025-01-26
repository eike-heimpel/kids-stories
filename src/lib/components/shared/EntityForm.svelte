<script lang="ts">
	import type { EntityWithCommon, EntityFormProps, ValidationError } from '$lib/types/forms';
	import type { Readable } from 'svelte/store';
	import AIAssistModal from './AIAssistModal.svelte';
	import { addToast } from '$lib/components/toastStore';
	import { createEventDispatcher } from 'svelte';

	type T = EntityWithCommon;
	type ValidationState = {
		errors: ValidationError[];
		isValid: boolean;
		getFieldError: (path: string) => string | undefined;
	};
	type ValidationStore = {
		subscribe: Readable<ValidationState>['subscribe'];
		validate: (data: any) => boolean;
	};

	export let entity: T;
	export let entityType: EntityFormProps<T>['entityType'];
	export let onSubmit: EntityFormProps<T>['onSubmit'];
	export let onCancel: EntityFormProps<T>['onCancel'];
	export let validation: ValidationStore | undefined = undefined;

	let isSubmitting = false;
	let showAIAssist = false;

	const dispatch = createEventDispatcher();

	// Handle form submission
	async function handleSubmit() {
		// Run validation if available
		if (validation && $validation) {
			console.log('Submitting entity:', entity);
			const isValid = validation.validate(entity);
			console.log('Validation result:', isValid);
			console.log('Validation state:', $validation);

			if (!isValid) {
				// Show validation errors
				const errors = ($validation as ValidationState).errors;
				if (errors.length > 0) {
					console.log('Validation errors:', errors);
					addToast(errors[0].message, 'error');
				}
				return;
			}
		}

		isSubmitting = true;
		try {
			await onSubmit(entity);
		} catch (error) {
			console.error(`Error submitting ${entityType}:`, error);
			addToast(`Failed to save ${entityType}`, 'error');
		} finally {
			isSubmitting = false;
		}
	}

	// Handle AI assist changes
	function handleAIChanges(changes: Record<string, any>) {
		// Create a copy of the current entity
		let updatedEntity = { ...entity };

		// Update each changed field
		for (const [key, value] of Object.entries(changes)) {
			if (value instanceof Object && !Array.isArray(value)) {
				// For objects (like llmContext), do a deep merge
				updatedEntity[key] = deepMerge(updatedEntity[key] || {}, value);
			} else {
				// For arrays and primitive values, replace directly
				updatedEntity[key] = value;
			}
		}

		// Update the entity with all changes at once
		entity = updatedEntity;

		// Dispatch aichanges event to notify parent components
		dispatch('aichanges', changes);
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
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6 p-4">
	<div class="flex justify-end gap-4">
		<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
			{isSubmitting ? 'Saving...' : `Save ${entityType}`}
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
	<slot name="name-field">
		<div class="form-control">
			<label class="label" for="name">
				<span class="label-text">{entityType} Name <span class="text-error">*</span></span>
			</label>
			<input
				type="text"
				id="name"
				class="input input-bordered"
				class:input-error={$validation?.getFieldError('name')}
				bind:value={entity.name}
			/>
			{#if $validation?.getFieldError('name')}
				<label class="label">
					<span class="label-text-alt text-error">{$validation.getFieldError('name')}</span>
				</label>
			{/if}
		</div>
	</slot>

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
	{entityType}
	onClose={() => (showAIAssist = false)}
	onApply={handleAIChanges}
	currentData={entity}
/>
