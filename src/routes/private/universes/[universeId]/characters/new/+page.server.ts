import { UniverseService } from '$lib/server/mongodb/services/UniverseService';
import { checkUniverseAccess } from '$lib/server/auth/guards';
import { ObjectId } from 'mongodb';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { CharacterService } from '$lib/server/mongodb/services/CharacterService';

const universeService = new UniverseService();
const characterService = new CharacterService();

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
            const characterData = {
                ...data,
                universeId: params.universeId,
                creatorId: locals.user?.id
            };

            const result = await characterService.create(characterData);
            const serializedResult = {
                ...result,
                _id: result._id?.toString() ?? ''
            };

            return {
                success: true,
                character: serializedResult
            };
        } catch (err) {
            console.error('Error creating character:', err);
            return {
                success: false,
                error: 'Failed to create character'
            };
        }
    }
};