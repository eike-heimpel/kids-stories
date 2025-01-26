<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { ENTITY_TYPES } from '$lib/types/entities';
	import { entityMetadata } from '$lib/stores/entityMetadata';
	let { data, children } = $props();
	let { supabase, session } = $derived(data);

	// Group entities by universe
	let entityGroups = $derived({
		universes: $entityMetadata.filter((e) => e.type === 'universe'),
		byUniverse: $entityMetadata.reduce(
			(acc, entity) => {
				if (entity.type === 'universe') return acc;
				if (!entity.universeId) return acc;
				acc[entity.universeId] = acc[entity.universeId] || {};
				acc[entity.universeId][entity.type] = acc[entity.universeId][entity.type] || [];
				acc[entity.universeId][entity.type].push(entity);
				return acc;
			},
			{} as Record<string, Record<string, any[]>>
		)
	});

	async function handleLogout() {
		if (!supabase) {
			console.error('Supabase client not initialized');
			return;
		}
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error('Error logging out:', error.message);
		}
		invalidateAll();
	}
</script>

<div class="drawer min-h-screen lg:drawer-open">
	<input id="drawer-toggle" type="checkbox" class="drawer-toggle" />

	<div class="drawer-content flex flex-col">
		<!-- Top navigation bar -->
		<div class="navbar bg-base-100 lg:hidden">
			<div class="flex-none">
				<label for="drawer-toggle" class="btn btn-square btn-ghost drawer-button">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block h-5 w-5 stroke-current"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						></path>
					</svg>
				</label>
			</div>
			<div class="flex-1">
				<span class="text-xl font-semibold">Dashboard</span>
			</div>
			<div class="flex-none">
				<button class="btn btn-square btn-ghost" on:click={handleLogout}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Page content -->
		<main class="flex-1 p-6 lg:px-8">
			{@render children()}
		</main>
	</div>

	<!-- Side navigation -->
	<div class="drawer-side z-40">
		<label for="drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>
		<div class="min-h-full w-64 bg-base-200 px-3 py-4 text-base-content">
			<!-- User profile -->
			<div class="mb-4 flex items-center gap-3 rounded-lg bg-base-100 p-3">
				<div class="avatar placeholder">
					<div class="w-10 rounded-full bg-neutral text-neutral-content">
						<span class="text-lg">{session?.user?.email?.charAt(0).toUpperCase()}</span>
					</div>
				</div>
				<div class="flex-1 truncate">
					<div class="text-sm font-medium">{session?.user?.email}</div>
				</div>
			</div>

			<!-- Navigation -->
			<ul class="menu gap-2">
				<li>
					<button
						on:click={() => goto('/private')}
						class="btn btn-primary btn-sm w-full justify-start"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
						Dashboard
					</button>
				</li>

				<!-- Universes Section -->
				<li class="menu-title">
					<span>Story Universes</span>
				</li>

				{#each entityGroups.universes as universe}
					<li>
						<details class="collapse">
							<summary class="collapse-title flex items-center gap-2 p-0">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								{universe.name}
							</summary>
							<div class="collapse-content">
								<ul class="menu menu-sm">
									<li>
										<a href={`/private/universes/${universe._id}`} class="flex items-center gap-2">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											Overview
										</a>
									</li>
									{#each Object.entries(ENTITY_TYPES) as [type, config]}
										{#if type !== 'universe'}
											<li>
												<a
													href={`/private/universes/${universe._id}/${config.pluralName}`}
													class="flex items-center gap-2"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														class="h-4 w-4"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d={config.icon === 'user'
																? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
																: config.icon === 'book'
																	? 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
																	: config.icon === 'map'
																		? 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
																		: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}
														/>
													</svg>
													{config.displayName}
													{#if entityGroups.byUniverse[universe._id]?.[type]?.length}
														<span class="badge badge-sm"
															>{entityGroups.byUniverse[universe._id][type].length}</span
														>
													{/if}
												</a>
											</li>
										{/if}
									{/each}
								</ul>
							</div>
						</details>
					</li>
				{/each}

				<li>
					<button
						on:click={() => goto('/private/purchase')}
						class="btn btn-ghost btn-sm w-full justify-start"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						Purchase
					</button>
				</li>
			</ul>

			<!-- Logout button -->
			<div class="fixed bottom-4 mt-auto w-[224px]">
				<button class="btn btn-outline btn-sm w-full" on:click={handleLogout}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					Logout
				</button>
			</div>
		</div>
	</div>
</div>
