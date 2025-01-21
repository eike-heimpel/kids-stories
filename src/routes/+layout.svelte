<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { userAuth } from '$lib/config';
	import NotificationToast from '$lib/components/NotificationToast.svelte';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	onMount(() => {
		if (!supabase) return;

		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<div class="flex min-h-screen flex-col">
	<div class="navbar border-b bg-base-100 px-4">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost gap-2 text-xl normal-case"> KitStarter </a>
		</div>
		{#if userAuth}
			<div class="flex-none gap-4">
				{#if session}
					<a href="/private" class="btn btn-ghost btn-sm px-6">Dashboard</a>
				{:else}
					<a href="/auth" class="btn btn-primary btn-sm px-6">Sign In</a>
				{/if}
			</div>
		{/if}
	</div>

	<div class="flex-1">
		{@render children()}
	</div>

	<NotificationToast />
</div>
