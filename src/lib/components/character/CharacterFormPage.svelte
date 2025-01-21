<script lang="ts">
	import type { Character } from '$lib/schemas/character';
	import type { ObjectId } from 'mongodb';
	import CharacterForm from './CharacterForm.svelte';
	import EntityFormPage from '$lib/components/shared/EntityFormPage.svelte';

	interface UniverseInfo {
		_id: string;
		name: string;
	}

	export let universe: UniverseInfo;
	export let character: Partial<Character> = {
		name: '',
		description: '',
		isPublic: false,
		backstory: '',
		traits: [],
		abilities: [],
		mainCharacter: false,
		status: 'alive' as const,
		universeId: universe._id,
		llmContext: {
			shortDescription: '',
			longDescription: '',
			keyPoints: [],
			relationships: '',
			hiddenInformation: '',
			storyImplications: '',
			tone: '',
			systemNotes: ''
		}
	};

	const apiPath = `/private/universes/${universe._id}/characters`;
	const layoutPath = `/private/universes/${universe._id}/characters`;
</script>

<EntityFormPage
	entity={character}
	entityType="character"
	parent={universe}
	basePath={apiPath}
	returnPath={apiPath}
	layoutBasePath={layoutPath}
>
	<svelte:fragment slot="default" let:handleSubmit let:handleCancel>
		<CharacterForm
			character={character as Character}
			onSubmit={handleSubmit}
			onCancel={handleCancel}
		/>
	</svelte:fragment>
</EntityFormPage>
