import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
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
