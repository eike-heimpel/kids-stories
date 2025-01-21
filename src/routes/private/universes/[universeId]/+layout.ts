import type { LayoutLoad } from './$types';
import { entityMetadata } from '$lib/stores/entityMetadata';

export const load: LayoutLoad = async ({ data }) => {
    // Initialize the entity metadata store
    entityMetadata.set(data.entityMetadata);

    return {
        universe: data.universe
    };
}; 