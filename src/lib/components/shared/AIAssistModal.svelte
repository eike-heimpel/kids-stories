<script lang="ts">
	import { addToast } from '$lib/components/toastStore';
	import { getAllEntityTypes, getEntityConfig } from '$lib/types/entities';
	import { entityMetadata } from '$lib/stores/entityMetadata';
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';

	export let show = false;
	export let entityType: string;
	export let onClose: () => void;
	export let onApply: (changes: Record<string, any>) => void;
	export let currentData: Record<string, any> = {};

	let loading = false;
	let previewChanges: Record<string, any> | null = null;
	let customInstructions = '';

	// Context management
	let additionalContextEntities: Record<string, any>[] = [];
	let searchQuery = '';
	let searchResults: Record<string, any>[] = [];
	let selectedTab = 'all';

	$: selectedEntityConfig = selectedTab === 'all' ? null : getEntityConfig(selectedTab);
	$: entityTitle = currentData.name || currentData.title || 'Untitled';
	$: entityTypeDisplay = getEntityConfig(entityType)?.displayName || entityType;
	// In-memory search function
	function searchEntities() {
		if (!searchQuery.trim() && selectedTab === 'all') {
			searchResults = [];
			return;
		}

		const query = searchQuery.toLowerCase();
		const excluded = new Set([currentData._id]);

		searchResults = $entityMetadata
			.filter((entity) => {
				if (excluded.has(entity._id)) return false;
				if (selectedTab !== 'all' && entity.type !== selectedTab) return false;
				const searchIn = entity.name || entity.title || '';
				return searchIn.toLowerCase().includes(query);
			})
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

	$: if (show && (searchQuery || selectedTab !== 'all')) {
		searchEntities();
	}

	function addEntityToContext(entity: Record<string, any>) {
		if (!additionalContextEntities.find((e) => e._id === entity._id)) {
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
			onApply(previewChanges);
		}
		onClose();
	}
</script>

{#if show}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[100] bg-black bg-opacity-50"
		on:click={onClose}
		on:keydown={(e) => e.key === 'Escape' && onClose()}
	></div>

	<!-- Panel -->
	<div
		class="fixed inset-0 z-[101] flex w-full flex-col bg-base-100 shadow-xl transition-transform duration-300 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[600px] lg:w-[900px] xl:w-[1200px] {show
			? 'translate-x-0'
			: 'translate-x-full'}"
		transition:slide={{ duration: 300, axis: 'x' }}
	>
		<!-- Header -->
		<div class="border-b border-base-300 bg-base-200 px-4 py-3 sm:px-6 sm:py-4">
			<div class="flex items-center justify-between">
				<div class="min-w-0 flex-1">
					<h2 class="truncate text-xl font-bold sm:text-3xl">{entityTitle}</h2>
					<p class="mt-0.5 text-base opacity-70 sm:mt-1 sm:text-lg">{entityTypeDisplay}</p>
				</div>
				<button class="btn btn-ghost btn-sm ml-2 sm:btn-lg" on:click={onClose} aria-label="Close">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 sm:h-8 sm:w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
			<!-- Context Section -->
			<section class="mb-6 sm:mb-8">
				<h3 class="mb-4 text-lg font-semibold sm:mb-6 sm:text-2xl">Context</h3>

				<!-- Entity Type Tabs -->
				<div class="-mx-4 mb-4 px-4 sm:mx-0 sm:mb-6 sm:px-0">
					<div class="tabs-boxed tabs flex overflow-x-auto pb-2 sm:pb-0">
						<button
							class="tab whitespace-nowrap {selectedTab === 'all' ? 'tab-active' : ''}"
							on:click={() => (selectedTab = 'all')}
						>
							All
						</button>
						{#each getAllEntityTypes() as config}
							<button
								class="tab whitespace-nowrap {selectedTab === config.name ? 'tab-active' : ''}"
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
				</div>

				<!-- Search Bar -->
				<div class="input-group mb-4 sm:mb-6">
					<input
						type="text"
						placeholder={selectedTab === 'all'
							? 'Search across all entities...'
							: `Search ${selectedEntityConfig?.displayName.toLowerCase() || ''}s...`}
						class="input input-bordered flex-1 text-base sm:text-lg"
						bind:value={searchQuery}
						on:keyup={(e) => e.key === 'Enter' && searchEntities()}
					/>
					{#if searchQuery}
						<button
							class="btn btn-square btn-sm sm:btn-lg"
							on:click={() => {
								searchQuery = '';
								if (selectedTab !== 'all') searchEntities();
							}}
						>
							×
						</button>
					{/if}
				</div>

				<!-- Search Results -->
				{#if searchResults.length > 0}
					<div class="mb-4 max-h-48 overflow-y-auto rounded-lg border border-base-300 sm:max-h-64">
						{#each searchResults as result}
							<div
								class="flex items-center justify-between border-b border-base-300 p-2 last:border-b-0 hover:bg-base-200 sm:p-3"
							>
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-2 sm:gap-3">
										<span class="sm:text-md truncate text-base font-medium">
											{result.name || result.title}
										</span>
										{#if selectedTab === 'all'}
											<span class="badge badge-sm sm:badge-lg">
												{getEntityConfig(result.type)?.displayName || result.type}
											</span>
										{/if}
									</div>
								</div>
								<button
									class="btn btn-primary btn-sm ml-2"
									on:click={() => addEntityToContext(result)}
								>
									Add
								</button>
							</div>
						{/each}
					</div>
				{:else if searchQuery || selectedTab !== 'all'}
					<div
						class="mb-4 rounded-lg bg-base-200 p-4 text-center text-base sm:mb-6 sm:p-6 sm:text-lg"
					>
						No {selectedTab === 'all'
							? 'entities'
							: selectedEntityConfig?.displayName.toLowerCase() + 's'} found
					</div>
				{/if}

				<!-- Selected Context -->
				{#if additionalContextEntities.length > 0}
					<div class="space-y-2 sm:space-y-3">
						<h4 class="text-lg font-medium sm:text-xl">Selected Context</h4>
						{#each additionalContextEntities as entity}
							<div class="flex items-center justify-between rounded-lg bg-base-200 p-3 sm:p-4">
								<div class="min-w-0 flex-1">
									<div class="text-base font-medium sm:text-lg">
										{entity.name || entity.title}
									</div>
									<div class="text-sm opacity-70 sm:text-base">
										{getEntityConfig(entity.type)?.displayName || entity.type}
									</div>
								</div>
								<button
									class="btn btn-ghost btn-sm ml-2 text-error sm:btn-lg"
									on:click={() => removeEntityFromContext(entity._id)}
								>
									Remove
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Instructions Section -->
			<section class="mb-6 sm:mb-8">
				<h3 class="mb-4 text-lg font-semibold sm:mb-6 sm:text-2xl">Instructions</h3>
				<textarea
					class="textarea textarea-bordered h-32 w-full text-base sm:h-40 sm:text-lg"
					placeholder="Add any specific instructions or context for the AI..."
					bind:value={customInstructions}
				/>
			</section>

			<!-- Preview Section -->
			{#if previewChanges}
				<section class="mb-6 sm:mb-8">
					<h3 class="mb-4 text-lg font-semibold sm:mb-6 sm:text-2xl">Preview Changes</h3>
					<div class="rounded-lg bg-base-200 p-4 sm:p-6">
						{#each Object.entries(previewChanges) as [key, value]}
							<div class="mb-4 last:mb-0 sm:mb-6">
								<h4 class="mb-2 text-lg font-medium sm:mb-3 sm:text-xl">{key}</h4>
								{#if Array.isArray(value)}
									<ul class="list-inside list-disc space-y-1 sm:space-y-2">
										{#each value as item}
											<li class="text-base sm:text-lg">{item}</li>
										{/each}
									</ul>
								{:else if typeof value === 'object'}
									<pre
										class="whitespace-pre-wrap rounded bg-base-300 p-3 text-sm sm:p-4 sm:text-base">{JSON.stringify(
											value,
											null,
											2
										)}</pre>
								{:else}
									<p class="whitespace-pre-wrap text-base sm:text-lg">{value}</p>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>

		<!-- Footer -->
		<div class="border-t border-base-300 bg-base-200 px-4 py-3 sm:px-6 sm:py-4">
			<div class="flex justify-end gap-2 sm:gap-3">
				<button
					class="btn btn-ghost btn-sm flex-1 sm:btn-lg sm:flex-none"
					on:click={onClose}
					disabled={loading}
				>
					Cancel
				</button>
				{#if !previewChanges}
					<button
						class="btn btn-primary btn-sm flex-1 sm:btn-lg sm:flex-none {loading ? 'loading' : ''}"
						on:click={generatePreview}
						disabled={loading ||
							(!customInstructions.trim() && additionalContextEntities.length === 0)}
					>
						Preview Changes
					</button>
				{:else}
					<button
						class="btn btn-primary btn-sm flex-1 sm:btn-lg sm:flex-none"
						on:click={handleApply}
					>
						Apply Changes
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
