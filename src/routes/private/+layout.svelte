<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	let { data, children } = $props();
	let { supabase, session } = $derived(data);

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
