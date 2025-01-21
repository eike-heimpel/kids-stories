<script lang="ts">
	import type { LLMContext } from '$lib/server/mongodb/types';
	import { addToast } from '$lib/components/toastStore';

	export let show = false;
	export let currentContext: Partial<LLMContext> = {};
	export let entityType: string;
	export let onClose: () => void;
	export let onApply: (changes: Record<string, any>) => void;
	export let currentData: Record<string, any> = {};
	export let universeId: string | undefined = undefined;

	/**
	 * A list of "quick adjust" options passed in from the parent,
	 * allowing different sets based on entity type (universe, character, etc.).
	 */

	let loading = false;
	let previewChanges: Record<string, any> | null = null;
	let customInstructions = '';
	let selectedAdjustments = new Set<string>();

	function toggleAdjustment(id: string) {
		if (selectedAdjustments.has(id)) {
			selectedAdjustments.delete(id);
		} else {
			selectedAdjustments.add(id);
		}
		// Reassigning triggers reactivity
		selectedAdjustments = new Set(selectedAdjustments);
	}

	async function generatePreview() {
		loading = true;
		try {
			const response = await fetch(`/api/${entityType}s/ai-assist`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prompt: customInstructions,
					currentData,
					additionalContext: {},
					universeId
				})
			});

			if (!response.ok) {
				throw new Error('Failed to generate preview');
			}

			const result = await response.json();

			previewChanges = result.updatedFields;

			// Show reasoning in toast
			addToast(result.reasoning, 'info');
		} catch (error) {
			console.error('Error generating preview:', error);
			addToast('Failed to generate preview. Please try again.', 'error');
		} finally {
			loading = false;
		}
	}

	function handleApply() {
		if (previewChanges) {
			onApply(previewChanges);
		}
		onClose();
	}

	// Reset state whenever the modal is reopened
	$: if (show) {
		selectedAdjustments = new Set();
		customInstructions = '';
		previewChanges = null;
	}
</script>

{#if show}
	<div class="modal modal-open">
		<div class="modal-box max-w-3xl">
			<h3 class="mb-4 text-lg font-bold">AI Assist</h3>

			<!-- Instructions Section -->
			<div class="form-control mb-6">
				<label class="label" for="customInstructions">
					<span class="label-text font-semibold">Instructions</span>
				</label>
				<div class="rounded-lg bg-base-200 p-4">
					<textarea
						id="customInstructions"
						class="textarea textarea-bordered h-32 w-full"
						placeholder="Add any specific instructions or context for the AI..."
						bind:value={customInstructions}
					/>
				</div>
			</div>

			<!-- Preview Section -->
			{#if previewChanges}
				<div class="mb-6">
					<h4 class="mb-2 font-semibold">Preview Changes</h4>
					<div class="max-h-96 space-y-4 overflow-y-auto rounded-lg bg-base-200 p-4">
						{#each Object.entries(previewChanges) as [key, value]}
							<div>
								<span class="text-sm font-semibold">{key}:</span>
								{#if Array.isArray(value)}
									<ul class="list-inside list-disc">
										{#each value as item}
											<li class="text-sm">{item}</li>
										{/each}
									</ul>
								{:else if typeof value === 'object'}
									<pre class="text-sm">{JSON.stringify(value, null, 2)}</pre>
								{:else}
									<p class="text-sm">{value}</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="modal-action">
				<button class="btn btn-ghost" on:click={onClose} disabled={loading}>Cancel</button>
				{#if !previewChanges}
					<button
						class="btn btn-primary {loading ? 'loading' : ''}"
						on:click={generatePreview}
						disabled={loading || (selectedAdjustments.size === 0 && !customInstructions.trim())}
					>
						Preview Changes
					</button>
				{:else}
					<button class="btn btn-primary" on:click={handleApply}>Apply Changes</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
