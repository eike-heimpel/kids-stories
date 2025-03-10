import { UniverseService } from '$lib/server/mongodb/services/UniverseService';
import { checkUniverseAccess } from '$lib/server/auth/guards';
import { ObjectId } from 'mongodb';
import type { LayoutServerLoad } from './$types';
import { CharacterService } from '$lib/server/mongodb/services/CharacterService';
import type { EntityMetadata } from '$lib/stores/entityMetadata';

const universeService = new UniverseService();

export const load: LayoutServerLoad = async ({ params, locals }) => {
    const universe = await universeService.findById(new ObjectId(params.universeId));

    // This will throw appropriate errors if access is denied
    checkUniverseAccess(universe, locals.user?.id);

    // Convert ObjectId to string for serialization
    const serializedUniverse = {
        ...universe,
        _id: universe?._id?.toString()
    };

    const characterService = new CharacterService();

    // For now, only load characters. Add other services as they're implemented
    const [characters] = await Promise.all([
        characterService.getBasicInfo(params.universeId)
    ]);

    const entityMetadata: EntityMetadata[] = [
        ...characters
        // Add other entity types here as they're implemented
    ];

    return {
        universe: serializedUniverse,
        entityMetadata
    };
}; 