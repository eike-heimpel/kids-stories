<script lang="ts">
	import type { z } from 'zod';
	import { isFieldRequired } from '$lib/utils/schema';

	export let schema: z.ZodType<any>;
	export let path: string;
	export let label: string;
	export let validation: { getFieldError: (path: string) => string | undefined } | undefined =
		undefined;
	export let type: 'text' | 'textarea' | 'number' | 'url' = 'text';
	export let value: any;
	export let placeholder = '';

	$: isRequired = isFieldRequired(schema, path);
	$: error = validation?.getFieldError(path);
</script>

<div class="form-control">
	<label class="label" for={path}>
		<span class="label-text"
			>{label}
			{#if isRequired}<span class="text-error">*</span>{/if}</span
		>
	</label>

	{#if type === 'textarea'}
		<textarea
			id={path}
			class="textarea textarea-bordered"
			class:input-error={error}
			bind:value
			{placeholder}
		/>
	{:else}
		<input
			id={path}
			{type}
			class="input input-bordered"
			class:input-error={error}
			bind:value
			{placeholder}
		/>
	{/if}

	{#if error}
		<label class="label">
			<span class="label-text-alt text-error">{error}</span>
		</label>
	{/if}
</div>
