import { writable } from 'svelte/store';
import type { EntityType } from '$lib/types/entities';

export interface EntityMetadata {
    _id: string;
    name: string | undefined;
    title: string | undefined;  // Some entities use title instead of name
    type: EntityType;
    displayInfo?: {  // Optional extra display info based on entity type
        status?: string;
        species?: string;
        genre?: string[];
        tags?: string[];
    };
}

function createEntityMetadataStore() {
    const { subscribe, set, update } = writable<EntityMetadata[]>([]);

    return {
        subscribe,
        set,
        update,
        addEntities: (entities: EntityMetadata[]) => update(current => {
            // Create a map of existing entities by ID
            const existingMap = new Map(current.map(e => [e._id, e]));

            // Update or add new entities
            entities.forEach(entity => {
                existingMap.set(entity._id, entity);
            });

            return Array.from(existingMap.values());
        }),
        removeEntities: (entityIds: string[]) => update(current => {
            const idsToRemove = new Set(entityIds);
            return current.filter(entity => !idsToRemove.has(entity._id));
        }),
        clear: () => set([])
    };
}

export const entityMetadata = createEntityMetadataStore(); 