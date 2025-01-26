import { error } from '@sveltejs/kit';
import { UniverseService } from '$lib/server/mongodb/services/UniverseService';
import type { PageServerLoad, Actions } from './$types';
import { ObjectId } from 'mongodb';
import { PlotService } from '$lib/server/mongodb/services/PlotService';
import type { Plot } from '$lib/schemas/plot';
import { checkUniverseAccess } from '$lib/server/auth/guards';

const universeService = new UniverseService();
const plotService = new PlotService();

interface LoadParams {
    params: {
        universeId: string;
    };
}

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

export const actions: Actions = {
    save: async ({ request, params, locals }) => {
        const formData = await request.formData();
        const data = JSON.parse(formData.get('data') as string);

        try {
            // Add universe ID and creator ID
            const plotData = {
                ...data,
                universeId: params.universeId,
                creatorId: locals.user?.id
            };

            const result = await plotService.create(plotData);
            const serializedResult = {
                ...result,
                _id: result._id?.toString() ?? ''
            };

            return {
                success: true,
                plot: serializedResult
            };
        } catch (err) {
            console.error('Error creating plot:', err);
            return {
                success: false,
                error: 'Failed to create plot'
            };
        }
    }
};