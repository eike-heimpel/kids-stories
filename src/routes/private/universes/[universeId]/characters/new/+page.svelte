<script lang="ts">
	import type { PageData } from './$types';
	import CharacterFormPage from '$lib/components/character/CharacterFormPage.svelte';

	export let data: PageData;
	const { universe } = data;
</script>

<CharacterFormPage {universe} />
