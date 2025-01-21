<script lang="ts">
	import type { z } from 'zod';
	import { isFieldRequired } from '$lib/utils/schema';

	export let schema: z.ZodType<any>;
	export let path: string;
	export let label: string;
	export let value: string[] = [];
	export let validation: { getFieldError: (path: string) => string | undefined } | undefined =
		undefined;
	export let placeholder = '';

	$: isRequired = isFieldRequired(schema, path);
	$: error = validation?.getFieldError(path);

	let inputValue = value?.join(', ') || '';

	function updateArray(input: string) {
		const newValue = input
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
		value = newValue;
		dispatch('change');
	}

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher<{
		change: void;
	}>();
</script>

<div class="form-control">
	<label class="label" for={path}>
		<span class="label-text"
			>{label}
			{#if isRequired}<span class="text-error">*</span>{/if}</span
		>
	</label>
	<input
		type="text"
		id={path}
		class="input input-bordered"
		class:input-error={error}
		bind:value={inputValue}
		on:input={(e) => updateArray(e.currentTarget.value)}
		{placeholder}
	/>
	{#if error}
		<label class="label">
			<span class="label-text-alt text-error">{error}</span>
		</label>
	{/if}
</div>
