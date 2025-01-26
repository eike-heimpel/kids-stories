<script lang="ts">
	import PlotFormPage from '$lib/components/plot/PlotFormPage.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<PlotFormPage plot={data.plot} universe={data.universe} />
