<script lang="ts">
	import type { Character } from '$lib/server/mongodb/types';
	import EntityForm from '../shared/EntityForm.svelte';
	import { page } from '$app/stores';

	export let character: Partial<Character>;
	export let onSubmit: (data: Partial<Character>) => void;
	export let onCancel: () => void;

	// Quick adjust options for AI assist
	const quickAdjustOptions = [
		{ id: 'more-detailed', label: 'Make more detailed' },
		{ id: 'more-mysterious', label: 'Make more mysterious' },
		{ id: 'more-heroic', label: 'Make more heroic' },
		{ id: 'more-villainous', label: 'Make more villainous' },
		{ id: 'more-complex', label: 'Add more complexity' },
		{ id: 'more-relatable', label: 'Make more relatable' }
	];

	// Get query parameters if they exist
	$: if ($page?.url?.searchParams) {
		const name = $page.url.searchParams.get('name');
		if (name && !character.name) character.name = name;
	}
</script>

<EntityForm entity={character} entityType="character" {onSubmit} {onCancel} {quickAdjustOptions}>
	<div class="grid gap-4 md:grid-cols-2">
		<!-- Basic Information -->
		<div class="form-control">
			<label class="label" for="description">
				<span class="label-text">Description</span>
			</label>
			<textarea
				id="description"
				class="textarea textarea-bordered h-24"
				bind:value={character.description}
			/>
		</div>

		<div class="form-control">
			<label class="label" for="backstory">
				<span class="label-text">Backstory</span>
			</label>
			<textarea
				id="backstory"
				class="textarea textarea-bordered h-24"
				bind:value={character.backstory}
			/>
		</div>

		<!-- Character Details -->
		<div class="form-control">
			<label class="label" for="species">
				<span class="label-text">Species</span>
			</label>
			<input type="text" id="species" class="input input-bordered" bind:value={character.species} />
		</div>

		<div class="form-control">
			<label class="label" for="age">
				<span class="label-text">Age</span>
			</label>
			<input
				type="number"
				id="age"
				class="input input-bordered"
				bind:value={character.age}
				min="0"
				step="1"
			/>
		</div>

		<!-- Status and Role -->
		<div class="form-control">
			<label class="label" for="status">
				<span class="label-text">Status</span>
			</label>
			<select id="status" class="select select-bordered" bind:value={character.status}>
				<option value="alive">Alive</option>
				<option value="deceased">Deceased</option>
				<option value="unknown">Unknown</option>
			</select>
		</div>

		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text">Main Character</span>
				<input type="checkbox" class="toggle" bind:checked={character.mainCharacter} />
			</label>
		</div>

		<!-- Traits and Abilities -->
		<div class="form-control">
			<label class="label" for="traits">
				<span class="label-text">Traits (comma-separated)</span>
			</label>
			<input
				type="text"
				id="traits"
				class="input input-bordered"
				value={character.traits?.join(', ') || ''}
				on:input={(e) => {
					character.traits = e.currentTarget.value
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean);
				}}
				placeholder="brave, loyal, intelligent"
			/>
		</div>

		<div class="form-control">
			<label class="label" for="abilities">
				<span class="label-text">Abilities (comma-separated)</span>
			</label>
			<input
				type="text"
				id="abilities"
				class="input input-bordered"
				value={character.abilities?.join(', ') || ''}
				on:input={(e) => {
					character.abilities = e.currentTarget.value
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean);
				}}
				placeholder="magic, swordsmanship, healing"
			/>
		</div>

		<!-- Tags -->
		<div class="form-control">
			<label class="label" for="tags">
				<span class="label-text">Tags (comma-separated)</span>
			</label>
			<input
				type="text"
				id="tags"
				class="input input-bordered"
				value={character.tags?.join(', ') || ''}
				on:input={(e) => {
					character.tags = e.currentTarget.value
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean);
				}}
				placeholder="hero, mentor, antagonist"
			/>
		</div>
	</div>
</EntityForm>
