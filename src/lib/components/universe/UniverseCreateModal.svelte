<script lang="ts">
	import { addToast } from '$lib/components/toastStore';

	export let show = false;
	export let onClose: () => void;
	export let onSubmit: (data: { name: string; language: string }) => void;

	let name = '';
	let language = '';
	let isSubmitting = false;

	function handleSubmit() {
		if (!name.trim() || !language.trim()) {
			addToast('Please fill in both name and language', 'warning');
			return;
		}

		isSubmitting = true;
		try {
			onSubmit({ name: name.trim(), language: language.trim() });
			name = '';
			language = '';
			onClose();
		} catch (error) {
			console.error('Error submitting:', error);
			addToast('Failed to create universe. Please try again.', 'error');
		} finally {
			isSubmitting = false;
		}
	}

	// Reset form when modal is opened
	$: if (show) {
		name = '';
		language = '';
	}
</script>

{#if show}
	<div class="modal modal-open">
		<div class="modal-box">
			<h3 class="mb-4 text-lg font-bold">Create New Universe</h3>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<div class="form-control">
					<label class="label" for="name">
						<span class="label-text">Universe Name</span>
					</label>
					<input
						type="text"
						id="name"
						class="input input-bordered"
						bind:value={name}
						placeholder="Enter universe name"
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="language">
						<span class="label-text">Language</span>
					</label>
					<input
						type="text"
						id="language"
						class="input input-bordered"
						bind:value={language}
						placeholder="Enter language"
						required
					/>
				</div>

				<div class="modal-action">
					<button type="button" class="btn btn-ghost" on:click={onClose} disabled={isSubmitting}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
						{isSubmitting ? 'Creating...' : 'Create Universe'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
