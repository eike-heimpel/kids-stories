<script lang="ts">
	import type { z } from 'zod';
	import { isFieldRequired } from '$lib/utils/schema';

	export let schema: z.ZodType<any>;
	export let path: string;
	export let label: string;
	export let value: string;
	export let options: Array<{ value: string; label: string }>;
	export let validation: { getFieldError: (path: string) => string | undefined } | undefined =
		undefined;

	$: isRequired = isFieldRequired(schema, path);
	$: error = validation?.getFieldError(path);

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher<{
		change: void;
	}>();

	function handleChange() {
		dispatch('change');
	}
</script>

<div class="form-control">
	<label class="label" for={path}>
		<span class="label-text"
			>{label}
			{#if isRequired}<span class="text-error">*</span>{/if}</span
		>
	</label>
	<select
		id={path}
		class="select select-bordered"
		class:select-error={error}
		bind:value
		on:change={handleChange}
	>
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	{#if error}
		<label class="label">
			<span class="label-text-alt text-error">{error}</span>
		</label>
	{/if}
</div>
