import type { Universe, Character, Location, Plot, Event, WorldRule, StoryArc } from '$lib/server/mongodb/types';

export interface EntityTypeConfig<T = any> {
    name: string;  // The entity type name (e.g. 'character')
    pluralName: string;  // Pluralized name for API endpoints (e.g. 'characters')
    displayName: string;  // Display name in UI (e.g. 'Character')
    description: string;  // Brief description of the entity type
    icon?: string;  // Optional icon identifier
    searchableFields: string[];  // Fields that should be searched
    summaryFields: string[];  // Fields to show in search results
}

// Central registry of all entity types
export const ENTITY_TYPES: Record<string, EntityTypeConfig> = {
    universe: {
        name: 'universe',
        pluralName: 'universes',
        displayName: 'Universe',
        description: 'Story universes and worlds',
        icon: 'globe',
        searchableFields: ['name', 'description', 'genre', 'tags'],
        summaryFields: ['name', 'description', 'genre']
    },
    character: {
        name: 'character',
        pluralName: 'characters',
        displayName: 'Character',
        description: 'Story characters',
        icon: 'user',
        searchableFields: ['name', 'description', 'backstory', 'traits', 'species', 'tags'],
        summaryFields: ['name', 'description', 'species', 'status']
    },
    location: {
        name: 'location',
        pluralName: 'locations',
        displayName: 'Location',
        description: 'Story locations and places',
        icon: 'map',
        searchableFields: ['name', 'description', 'type', 'climate', 'tags'],
        summaryFields: ['name', 'description', 'type', 'status']
    },
    plot: {
        name: 'plot',
        pluralName: 'plots',
        displayName: 'Plot',
        description: 'Story plots and events',
        icon: 'book',
        searchableFields: ['title', 'summary', 'tags'],
        summaryFields: ['title', 'summary', 'status']
    },
    event: {
        name: 'event',
        pluralName: 'events',
        displayName: 'Event',
        description: 'Historical or future events',
        icon: 'calendar',
        searchableFields: ['title', 'description', 'significance', 'tags'],
        summaryFields: ['title', 'description', 'type']
    },
    worldRule: {
        name: 'worldRule',
        pluralName: 'worldRules',
        displayName: 'World Rule',
        description: 'Laws and rules of the universe',
        icon: 'scale',
        searchableFields: ['name', 'description', 'type', 'tags'],
        summaryFields: ['name', 'description', 'type', 'scope']
    },
    storyArc: {
        name: 'storyArc',
        pluralName: 'storyArcs',
        displayName: 'Story Arc',
        description: 'Major story arcs and themes',
        icon: 'trending-up',
        searchableFields: ['title', 'description', 'themes', 'tags'],
        summaryFields: ['title', 'description', 'status']
    }
} as const;

// Helper functions
export function getAllEntityTypes(): EntityTypeConfig[] {
    return Object.values(ENTITY_TYPES);
}

export function getEntityConfig<T>(type: string): EntityTypeConfig<T> | undefined {
    return ENTITY_TYPES[type];
}

export function getEntityPluralName(type: string): string {
    return ENTITY_TYPES[type]?.pluralName || `${type}s`;
}

// Type for entity type keys
export type EntityType = keyof typeof ENTITY_TYPES;

// Type mapping from entity type to its interface
export type EntityTypeMap = {
    universe: Universe;
    character: Character;
    location: Location;
    plot: Plot;
    event: Event;
    worldRule: WorldRule;
    storyArc: StoryArc;
}

// Utility type to get the type of an entity
export type EntityTypeOf<T extends keyof EntityTypeMap> = EntityTypeMap[T]; 