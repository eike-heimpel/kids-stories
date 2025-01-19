<script lang="ts">
	import type { Universe } from '$lib/server/mongodb/types';
	import EntityList from '$lib/components/shared/EntityList.svelte';

	// Dummy data for development
	const dummyUniverses: Universe[] = [
		{
			_id: '1' as any,
			name: 'Fantasy World',
			description: 'A magical realm of wonder and adventure',
			createdAt: new Date('2024-01-01'),
			updatedAt: new Date('2024-01-01'),
			version: 1,
			lastModifiedBy: 'user123',
			llmContext: {
				shortDescription: 'A high fantasy setting with unique magic systems'
			},
			creatorId: 'user123',
			isPublic: true,
			genre: ['Fantasy', 'Adventure'],
			tags: ['magic', 'medieval']
		},
		{
			_id: '2' as any,
			name: 'Sci-Fi Future',
			description: 'A distant future where technology and humanity merge',
			createdAt: new Date('2024-01-02'),
			updatedAt: new Date('2024-01-02'),
			version: 1,
			lastModifiedBy: 'user123',
			llmContext: {
				shortDescription: 'A post-singularity science fiction universe'
			},
			creatorId: 'user123',
			isPublic: true,
			genre: ['Science Fiction', 'Cyberpunk'],
			tags: ['future', 'technology']
		}
	];
</script>

<EntityList items={dummyUniverses} title="Story Universes" entityType="universe" />
