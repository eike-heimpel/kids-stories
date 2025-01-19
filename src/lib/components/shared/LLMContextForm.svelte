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

	// Placeholder function for AI assistance
	function generateWithAI(field: keyof LLMContext) {
		console.log('Generate with AI for field:', field);
		// Will be implemented with actual AI integration later
	}
</script>

<div class="space-y-4">
	<div class="form-control">
		<label class="label" for="shortDescription">
			<span class="label-text">Short Description</span>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				on:click={() => generateWithAI('shortDescription')}
				{disabled}
			>
				AI Assist
			</button>
		</label>
		<textarea
			id="shortDescription"
			class="textarea textarea-bordered"
			bind:value={context.shortDescription}
			{disabled}
		/>
	</div>

	<div class="form-control">
		<label class="label" for="longDescription">
			<span class="label-text">Long Description</span>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				on:click={() => generateWithAI('longDescription')}
				{disabled}
			>
				AI Assist
			</button>
		</label>
		<textarea
			id="longDescription"
			class="textarea textarea-bordered"
			bind:value={context.longDescription}
			{disabled}
		/>
	</div>

	<div class="form-control">
		<label class="label" for="keyPoints">
			<span class="label-text">Key Points</span>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				on:click={() => generateWithAI('keyPoints')}
				{disabled}
			>
				AI Assist
			</button>
		</label>
		<textarea
			id="keyPoints"
			class="textarea textarea-bordered"
			bind:value={keyPointsText}
			on:input={(e) => updateKeyPoints(e.currentTarget.value)}
			{disabled}
			placeholder="Enter each key point on a new line"
		/>
	</div>

	<div class="form-control">
		<label class="label" for="relationships">
			<span class="label-text">Relationships</span>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				on:click={() => generateWithAI('relationships')}
				{disabled}
			>
				AI Assist
			</button>
		</label>
		<textarea
			id="relationships"
			class="textarea textarea-bordered"
			bind:value={context.relationships}
			{disabled}
		/>
	</div>

	<div class="form-control">
		<label class="label" for="hiddenInformation">
			<span class="label-text">Hidden Information</span>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				on:click={() => generateWithAI('hiddenInformation')}
				{disabled}
			>
				AI Assist
			</button>
		</label>
		<textarea
			id="hiddenInformation"
			class="textarea textarea-bordered"
			bind:value={context.hiddenInformation}
			{disabled}
		/>
	</div>

	<div class="form-control">
		<label class="label" for="storyImplications">
			<span class="label-text">Story Implications</span>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				on:click={() => generateWithAI('storyImplications')}
				{disabled}
			>
				AI Assist
			</button>
		</label>
		<textarea
			id="storyImplications"
			class="textarea textarea-bordered"
			bind:value={context.storyImplications}
			{disabled}
		/>
	</div>

	<div class="form-control">
		<label class="label" for="tone">
			<span class="label-text">Tone</span>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				on:click={() => generateWithAI('tone')}
				{disabled}
			>
				AI Assist
			</button>
		</label>
		<textarea id="tone" class="textarea textarea-bordered" bind:value={context.tone} {disabled} />
	</div>

	<div class="form-control">
		<label class="label" for="systemNotes">
			<span class="label-text">System Notes</span>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				on:click={() => generateWithAI('systemNotes')}
				{disabled}
			>
				AI Assist
			</button>
		</label>
		<textarea
			id="systemNotes"
			class="textarea textarea-bordered"
			bind:value={context.systemNotes}
			{disabled}
		/>
	</div>
</div>
