import { UniverseService } from '$lib/server/mongodb/services/UniverseService';
import { checkUniverseAccess } from '$lib/server/auth/guards';
import { ObjectId } from 'mongodb';
import type { LayoutServerLoad } from './$types';

const universeService = new UniverseService();

export const load: LayoutServerLoad = async ({ params, locals }) => {
    const universe = await universeService.findById(new ObjectId(params.universeId));

    // This will throw appropriate errors if access is denied
    checkUniverseAccess(universe, locals.user?.id);

    // Convert ObjectId to string for serialization
    return {
        universe: {
            ...universe,
            _id: universe?._id?.toString()
        }
    };
}; 