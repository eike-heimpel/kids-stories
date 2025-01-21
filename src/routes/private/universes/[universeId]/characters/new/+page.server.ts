import { UniverseService } from '$lib/server/mongodb/services/UniverseService';
import { checkUniverseAccess } from '$lib/server/auth/guards';
import { ObjectId } from 'mongodb';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const universeService = new UniverseService();

export const load: PageServerLoad = async ({ params, locals }) => {
    const universe = await universeService.findById(new ObjectId(params.universeId));

    // This will throw appropriate errors if access is denied
    checkUniverseAccess(universe, locals.user?.id);

    return {
        universe: {
            ...universe,
            _id: universe?._id?.toString() ?? params.universeId
        }
    };
}; 