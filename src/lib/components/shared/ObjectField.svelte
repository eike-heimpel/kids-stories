<script lang="ts">
	import type { z } from 'zod';
	import { isFieldRequired } from '$lib/utils/schema';

	export let schema: z.ZodType<any>;
	export let path: string;
	export let label: string;
	export let value: Record<string, any> | undefined;
	export let validation: { getFieldError: (path: string) => string | undefined } | undefined =
		undefined;
	export let fields: Array<{
		key: string;
		label: string;
		type?: 'text' | 'number' | 'url';
		placeholder?: string;
	}>;

	$: isRequired = isFieldRequired(schema, path);
	$: error = validation?.getFieldError(path);
	$: currentValue = value || {};

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher<{
		change: void;
	}>();

	function handleChange() {
		if (!value) {
			value = {};
		}
		dispatch('change');
	}
</script>

<div class="form-control">
	<label class="label">
		<span class="label-text"
			>{label}
			{#if isRequired}<span class="text-error">*</span>{/if}</span
		>
	</label>
	<div class="flex gap-4">
		{#each fields as field}
			<div class="form-control">
				{#if field.label}
					<label class="label" for={`${path}.${field.key}`}>
						<span class="label-text">{field.label}</span>
					</label>
				{/if}
				<input
					type={field.type || 'text'}
					id={`${path}.${field.key}`}
					class="input input-bordered"
					class:input-error={validation?.getFieldError(`${path}.${field.key}`)}
					bind:value={currentValue[field.key]}
					placeholder={field.placeholder}
					on:input={handleChange}
				/>
				{#if validation?.getFieldError(`${path}.${field.key}`)}
					<label class="label">
						<span class="label-text-alt text-error">
							{validation.getFieldError(`${path}.${field.key}`)}
						</span>
					</label>
				{/if}
			</div>
		{/each}
	</div>
	{#if error}
		<label class="label">
			<span class="label-text-alt text-error">{error}</span>
		</label>
	{/if}
</div>
