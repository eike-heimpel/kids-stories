<script lang="ts">
	import type { LLMContext } from '$lib/server/mongodb/types';

	export let context: LLMContext;
	export let disabled = false;

	// Local variable for key points text input
	let keyPointsText = context.keyPoints?.join('\n') || '';

	// Update key points array when text changes
	function updateKeyPoints(text: string) {
		context.keyPoints = text.split('\n').filter(Boolean);
	}
</script>

<div class="space-y-4">
	<div class="form-control">
		<label class="label" for="shortDescription">
			<span class="label-text">Short Description</span>
		</label>
		<textarea
			id="shortDescription"
			class="textarea textarea-bordered"
			bind:value={context.shortDescription}
			{disabled}
		></textarea>
	</div>

	<div class="form-control">
		<label class="label" for="longDescription">
			<span class="label-text">Long Description</span>
		</label>
		<textarea
			id="longDescription"
			class="textarea textarea-bordered"
			bind:value={context.longDescription}
			{disabled}
		></textarea>
	</div>

	<div class="form-control">
		<label class="label" for="keyPoints">
			<span class="label-text">Key Points</span>
		</label>
		<textarea
			id="keyPoints"
			class="textarea textarea-bordered"
			bind:value={keyPointsText}
			on:input={(e) => updateKeyPoints(e.currentTarget.value)}
			{disabled}
			placeholder="Enter each key point on a new line"
		></textarea>
	</div>

	<div class="form-control">
		<label class="label" for="relationships">
			<span class="label-text">Relationships</span>
		</label>
		<textarea
			id="relationships"
			class="textarea textarea-bordered"
			bind:value={context.relationships}
			{disabled}
		></textarea>
	</div>

	<div class="form-control">
		<label class="label" for="hiddenInformation">
			<span class="label-text">Hidden Information</span>
		</label>
		<textarea
			id="hiddenInformation"
			class="textarea textarea-bordered"
			bind:value={context.hiddenInformation}
			{disabled}
		></textarea>
	</div>

	<div class="form-control">
		<label class="label" for="storyImplications">
			<span class="label-text">Story Implications</span>
		</label>
		<textarea
			id="storyImplications"
			class="textarea textarea-bordered"
			bind:value={context.storyImplications}
			{disabled}
		></textarea>
	</div>

	<div class="form-control">
		<label class="label" for="tone">
			<span class="label-text">Tone</span>
		</label>
		<textarea id="tone" class="textarea textarea-bordered" bind:value={context.tone} {disabled}
		></textarea>
	</div>

	<div class="form-control">
		<label class="label" for="systemNotes">
			<span class="label-text">System Notes</span>
		</label>
		<textarea
			id="systemNotes"
			class="textarea textarea-bordered"
			bind:value={context.systemNotes}
			{disabled}
		></textarea>
	</div>
</div>
