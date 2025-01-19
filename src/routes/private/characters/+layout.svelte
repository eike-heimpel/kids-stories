<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<div class="container mx-auto p-4">
	<div class="breadcrumbs mb-4 text-sm">
		<ul>
			{#each data.breadcrumbs as crumb, i}
				<li>
					{#if i === data.breadcrumbs.length - 1}
						<span class="font-bold">{crumb.label}</span>
					{:else}
						<a href={crumb.href}>{crumb.label}</a>
					{/if}
				</li>
			{/each}
		</ul>
	</div>

	<slot />
</div>
