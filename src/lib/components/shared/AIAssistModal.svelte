<script lang="ts">
	import type { LLMContext } from '$lib/server/mongodb/types';

	export let show = false;
	export let currentContext: LLMContext;
	export let onClose: () => void;
	export let onApply: (changes: Partial<LLMContext>) => void;

	/**
	 * A list of "quick adjust" options passed in from the parent,
	 * allowing different sets based on entity type (universe, character, etc.).
	 */
	export let quickAdjustOptions: Array<{ id: string; label: string }> = [];

	let loading = false;
	let previewChanges: Partial<LLMContext> | null = null;
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
			// TODO: Replace with actual API call for AI-based context updates
			await new Promise((resolve) => setTimeout(resolve, 1000));
			previewChanges = {
				shortDescription: 'Preview: Updated short description...',
				longDescription: 'Preview: Updated long description...'
				// ...Add other fields as needed
			};
		} catch (error) {
			console.error('Error generating preview:', error);
			// TODO: Show error toast or handle appropriately
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

			<!-- Quick Adjust Section -->
			{#if quickAdjustOptions.length > 0}
				<div class="mb-6">
					<h4 class="mb-2 font-semibold">Quick Adjustments</h4>
					<div class="grid grid-cols-2 gap-2">
						{#each quickAdjustOptions as option}
							<button
								class="btn btn-outline btn-sm justify-start {selectedAdjustments.has(option.id)
									? 'btn-primary'
									: ''}"
								on:click={() => toggleAdjustment(option.id)}
							>
								{option.label}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Instructions Section - Future Chat Interface -->
			<div class="form-control mb-6">
				<label class="label" for="customInstructions">
					<span class="label-text font-semibold">Instructions</span>
				</label>
				<!-- 
					Future Chat Component will replace this textarea.
					The chat component will need:
					1. Message history display area
					2. Input area for new messages
					3. Send button
					4. Loading states for AI responses
					
					The container is styled to accommodate these future elements:
					- Fixed height with scroll
					- Space for message bubbles
					- Room for input area at bottom
				-->
				<div class="rounded-lg bg-base-200 p-4" style="min-height: 200px">
					<textarea
						id="customInstructions"
						class="textarea textarea-bordered h-full w-full"
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
						{#if previewChanges.shortDescription}
							<div>
								<span class="text-sm font-semibold">Short Description:</span>
								<p class="text-sm">{previewChanges.shortDescription}</p>
							</div>
						{/if}
						{#if previewChanges.longDescription}
							<div>
								<span class="text-sm font-semibold">Long Description:</span>
								<p class="text-sm">{previewChanges.longDescription}</p>
							</div>
						{/if}
						<!-- Add other preview fields as needed -->
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
