<script lang="ts">
	const storyFeatures = [
		{
			title: 'Story Universes',
			description:
				'Create and manage your story universes, the foundation of your narrative worlds.',
			icon: '🌍',
			href: '/private/universes',
			color: 'primary'
		},
		{
			title: 'Characters',
			description: 'Coming soon - Develop and track your story characters.',
			icon: '👤',
			href: '/private/characters',
			color: 'secondary',
			disabled: true
		},
		{
			title: 'Locations',
			description: 'Coming soon - Create and manage locations in your story universes.',
			icon: '🏰',
			href: '/private/locations',
			color: 'accent',
			disabled: true
		},
		{
			title: 'Plots',
			description: 'Coming soon - Develop your story plots and narrative arcs.',
			icon: '📖',
			href: '/private/plots',
			color: 'info',
			disabled: true
		},
		{
			title: 'Events',
			description: 'Coming soon - Track significant events in your stories.',
			icon: '⚡',
			href: '/private/events',
			color: 'success',
			disabled: true
		},
		{
			title: 'World Rules',
			description: 'Coming soon - Define the rules and systems of your story worlds.',
			icon: '⚖️',
			href: '/private/world-rules',
			color: 'warning',
			disabled: true
		},
		{
			title: 'Story Arcs',
			description: 'Coming soon - Plan and manage overarching story arcs.',
			icon: '🔄',
			href: '/private/story-arcs',
			color: 'error',
			disabled: true
		}
	];
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-8 text-3xl font-bold">Story Builder Dashboard</h1>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each storyFeatures as feature}
			<div class="card bg-base-100 shadow-xl transition-shadow duration-200 hover:shadow-2xl">
				<div class="card-body">
					<div class="mb-4 text-4xl">{feature.icon}</div>
					<h2 class="card-title">{feature.title}</h2>
					<p>{feature.description}</p>
					<div class="card-actions mt-4 justify-end">
						<a
							href={feature.href}
							class="btn btn-{feature.color}"
							class:btn-disabled={feature.disabled}
						>
							{feature.disabled ? 'Coming Soon' : 'Explore'}
						</a>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-12 rounded-box bg-base-200 p-6">
		<h2 class="mb-4 text-2xl font-bold">Quick Start Guide</h2>
		<div class="steps steps-vertical">
			<div class="step step-primary">Create a new Universe to define your story world</div>
			<div class="step">Add Characters to populate your universe</div>
			<div class="step">Define Locations where your story takes place</div>
			<div class="step">Create Plots and Story Arcs to bring your narrative to life</div>
		</div>
	</div>
</div>
