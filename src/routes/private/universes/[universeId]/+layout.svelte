<!-- Universe layout with navigation -->
<script lang="ts">
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	const { universe } = data;
</script>

<div class="container mx-auto p-4">
	<header class="mb-8">
		<h1 class="mb-2 text-3xl font-bold">{universe.name}</h1>
		<div class="tabs">
			<a
				class="tab-bordered tab"
				class:tab-active={$page.url.pathname === `/private/universes/${universe._id}`}
				href={`/private/universes/${universe._id}`}
			>
				Overview
			</a>
			<a
				class="tab-bordered tab"
				class:tab-active={$page.url.pathname.includes('/characters')}
				href={`/private/universes/${universe._id}/characters`}
			>
				Characters
			</a>
			<!-- Add more tabs for other entity types -->
		</div>
	</header>

	<main>
		<slot />
	</main>
</div>
