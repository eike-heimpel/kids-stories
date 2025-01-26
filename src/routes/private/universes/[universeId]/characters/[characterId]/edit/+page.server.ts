import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { CharacterService } from '$lib/server/mongodb/services/CharacterService';
import { ObjectId } from 'mongodb';

const characterService = new CharacterService();

export const load: PageServerLoad = async ({ params, parent }) => {
    const { universeId, characterId } = params;
    const parentData = await parent();

    const character = await characterService.findById(new ObjectId(characterId));

    if (!character || character.universeId !== universeId || !character._id) {
        throw error(404, 'Character not found');
    }

    // Convert ObjectId to string for serialization
    return {
        character: {
            ...character,
            _id: character._id.toString()
        },
        universe: parentData.universe
    };
};

export const actions: Actions = {
    save: async ({ request, params }) => {
        const formData = await request.formData();
        const data = JSON.parse(formData.get('data') as string);

        try {
            const result = await characterService.update(
                new ObjectId(data._id),
                {
                    ...data,
                    lastModifiedBy: data.creatorId // Required by BaseService
                }
            );

            if (!result || !result._id) {
                return {
                    success: false,
                    error: 'Failed to update character'
                };
            }

            return {
                success: true,
                character: {
                    ...result,
                    _id: result._id.toString()
                }
            };
        } catch (err) {
            console.error('Error updating character:', err);
            return {
                success: false,
                error: 'Failed to update character'
            };
        }
    }
};
