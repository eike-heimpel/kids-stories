<script lang="ts">
	const navItems = [
		{ href: '/private/universes', label: 'Universes' },
		{ href: '/private/characters', label: 'Characters' },
		{ href: '/private/locations', label: 'Locations' },
		{ href: '/private/plots', label: 'Plots' },
		{ href: '/private/events', label: 'Events' },
		{ href: '/private/world-rules', label: 'World Rules' },
		{ href: '/private/story-arcs', label: 'Story Arcs' }
	];
</script>

<nav class="navbar bg-base-100">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl normal-case">Story Builder</a>
	</div>
	<div class="flex-none">
		<ul class="menu menu-horizontal px-1">
			{#each navItems as item}
				<li>
					<a href={item.href}>{item.label}</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>
