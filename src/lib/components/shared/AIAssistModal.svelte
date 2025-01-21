<script lang="ts">
	import type { LLMContext } from '$lib/server/mongodb/types';
	import { addToast } from '$lib/components/toastStore';
	import { getAllEntityTypes, getEntityConfig, type EntityTypeConfig } from '$lib/types/entities';
	import { entityMetadata } from '$lib/stores/entityMetadata';
	import { page } from '$app/stores';

	export let show = false;
	export let currentContext: Partial<LLMContext> = {};
	export let entityType: string;
	export let onClose: () => void;
	export let onApply: (changes: Record<string, any>) => void;
	export let currentData: Record<string, any> = {};

	/**
	 * A list of "quick adjust" options passed in from the parent,
	 * allowing different sets based on entity type (universe, character, etc.).
	 */

	let loading = false;
	let previewChanges: Record<string, any> | null = null;
	let customInstructions = '';

	// Context management
	let additionalContextEntities: Record<string, any>[] = [];
	let searchQuery = '';
	let searchResults: Record<string, any>[] = [];
	let selectedTab = 'all';

	$: selectedEntityConfig = selectedTab === 'all' ? null : getEntityConfig(selectedTab);

	// In-memory search function
	function searchEntities() {
		if (!searchQuery.trim() && selectedTab === 'all') {
			searchResults = [];
			return;
		}

		const query = searchQuery.toLowerCase();
		const excluded = new Set([currentData._id]);

		// Filter entities based on search criteria
		searchResults = $entityMetadata
			.filter((entity) => {
				// Exclude already selected entities and current entity
				if (excluded.has(entity._id)) return false;

				// Filter by type if a specific tab is selected
				if (selectedTab !== 'all' && entity.type !== selectedTab) return false;

				// Search in name or title
				const searchIn = entity.name || entity.title || '';
				return searchIn.toLowerCase().includes(query);
			})
			// Sort by relevance (exact matches first)
			.sort((a, b) => {
				const aName = (a.name || a.title || '').toLowerCase();
				const bName = (b.name || b.title || '').toLowerCase();
				const aStartsWith = aName.startsWith(query);
				const bStartsWith = bName.startsWith(query);

				if (aStartsWith && !bStartsWith) return -1;
				if (!aStartsWith && bStartsWith) return 1;
				return aName.localeCompare(bName);
			});
	}

	// Trigger search when query changes or tab changes
	$: if (show && (searchQuery || selectedTab !== 'all')) {
		searchEntities();
	}

	function addEntityToContext(entity: Record<string, any>) {
		if (!additionalContextEntities.find((e) => e._id === entity._id)) {
			// Get the full entity data from the metadata store
			const metadata = $entityMetadata.find((e) => e._id === entity._id);
			if (metadata) {
				additionalContextEntities = [...additionalContextEntities, metadata];
				searchResults = searchResults.filter((e) => e._id !== entity._id);
			}
		}
	}

	function removeEntityFromContext(entityId: string) {
		additionalContextEntities = additionalContextEntities.filter((e) => e._id !== entityId);
	}

	// Reset state whenever the modal is reopened
	$: if (show) {
		customInstructions = '';
		previewChanges = null;
		additionalContextEntities = [];
		searchQuery = '';
		searchResults = [];
		selectedTab = 'all';
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
					additionalContext: {
						entities: additionalContextEntities
					},
					universeId: $page.data.universe._id
				})
			});

			if (!response.ok) {
				throw new Error('Failed to generate preview');
			}

			const result = await response.json();
			previewChanges = result.updatedFields;
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
			// Dispatch the changes before closing
			onApply(previewChanges);
		}
		onClose();
	}
</script>

{#if show}
	<div class="modal modal-open">
		<div class="modal-box max-w-3xl">
			<h3 class="mb-4 text-lg font-bold">AI Assist</h3>

			<!-- Two Column Layout for Context Management -->
			<div class="mb-6 grid gap-4 lg:grid-cols-[2fr,3fr]">
				<!-- Left Column: Current Context -->
				<div class="order-2 lg:order-1">
					<div class="rounded-lg bg-base-200 p-4">
						<h4 class="mb-3 font-semibold">Current Context</h4>
						{#if additionalContextEntities.length > 0}
							<div class="flex flex-col gap-2">
								{#each additionalContextEntities as entity}
									<div class="flex items-center justify-between rounded bg-base-100 p-2">
										<div class="min-w-0 flex-1">
											<div class="truncate font-medium">
												{entity.name || entity.title}
											</div>
											<div class="text-xs opacity-70">
												{getEntityConfig(entity.type)?.displayName || entity.type}
											</div>
										</div>
										<button
											class="btn btn-ghost btn-sm"
											on:click={() => removeEntityFromContext(entity._id)}
										>
											Remove
										</button>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center opacity-70">
								<p>No additional context added</p>
								<p class="text-sm">Search and add entities to provide more context to the AI</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Right Column: Search and Add -->
				<div class="order-1 lg:order-2">
					<div class="rounded-lg bg-base-200 p-4">
						<h4 class="mb-3 font-semibold">Add Context</h4>

						<!-- Entity Type Tabs -->
						<div class="tabs-boxed tabs mb-3">
							<button
								class="tab {selectedTab === 'all' ? 'tab-active' : ''}"
								on:click={() => (selectedTab = 'all')}
							>
								All
							</button>
							{#each getAllEntityTypes() as config}
								<button
									class="tab {selectedTab === config.name ? 'tab-active' : ''}"
									on:click={() => (selectedTab = config.name)}
									title={config.description}
								>
									{#if config.icon}
										<i class="icon {config.icon} mr-1" />
									{/if}
									{config.displayName}
								</button>
							{/each}
						</div>

						<!-- Search Bar -->
						<div class="mb-3 flex gap-2">
							<input
								type="text"
								placeholder={selectedTab === 'all'
									? 'Search across all entities...'
									: `Search ${selectedEntityConfig?.displayName.toLowerCase() || ''}s...`}
								class="input input-bordered flex-1"
								bind:value={searchQuery}
								on:keyup={(e) => e.key === 'Enter' && searchEntities()}
							/>
							{#if searchQuery}
								<button
									class="btn btn-square btn-ghost"
									on:click={() => {
										searchQuery = '';
										if (selectedTab !== 'all') searchEntities();
									}}>×</button
								>
							{/if}
						</div>

						<!-- Results List -->
						<div class="min-h-[100px] rounded-lg bg-base-100 p-2">
							{#if searchResults.length > 0}
								<div class="max-h-48 overflow-y-auto">
									{#each searchResults as result}
										<div
											class="flex items-center justify-between border-b border-base-200 p-2 hover:bg-base-200"
										>
											<div class="min-w-0 flex-1">
												<div class="flex items-center gap-2">
													<span class="truncate font-medium">
														{result.name || result.title}
													</span>
													{#if selectedTab === 'all'}
														<span class="badge badge-sm">
															{getEntityConfig(result.type)?.displayName || result.type}
														</span>
													{/if}
												</div>
												{#if selectedEntityConfig && result.displayInfo}
													<div class="mt-1 flex gap-2">
														{#each Object.entries(result.displayInfo) as [key, value]}
															{#if value}
																<span class="badge badge-outline badge-sm">
																	{key}: {Array.isArray(value) ? value.join(', ') : value}
																</span>
															{/if}
														{/each}
													</div>
												{/if}
											</div>
											<button
												class="btn btn-ghost btn-sm ml-2"
												on:click={() => addEntityToContext(result)}
											>
												Add
											</button>
										</div>
									{/each}
								</div>
							{:else if searchQuery || selectedTab !== 'all'}
								<div class="p-4 text-center opacity-70">
									No {selectedTab === 'all'
										? 'entities'
										: selectedEntityConfig?.displayName.toLowerCase() + 's'} found
								</div>
							{:else}
								<div class="p-4 text-center opacity-70">
									Search or select a category to add context
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

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
						disabled={loading ||
							(!customInstructions.trim() && additionalContextEntities.length === 0)}
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
