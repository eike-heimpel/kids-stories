import { CharacterService } from '$lib/server/mongodb/services/CharacterService';
import { checkCharacterAccess } from '$lib/server/auth/guards';
import { ObjectId } from 'mongodb';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { LayoutData } from '../../$types';

const characterService = new CharacterService();

export const load: PageServerLoad = async ({ params, locals, parent }) => {
    const parentData = await parent();
    const universe = parentData.universe;

    if (!universe?._id) {
        throw error(404, 'Universe not found');
    }

    const character = await characterService.findById(new ObjectId(params.characterId));

    // Verify character belongs to this universe
    if (!character || character.universeId !== universe._id.toString()) {
        throw error(404, 'Character not found in this universe');
    }

    // This will throw appropriate errors if access is denied
    checkCharacterAccess(character, locals.user?.id);

    // Convert ObjectId to string for serialization
    return {
        character: {
            ...character,
            _id: character._id?.toString()
        }
    };
}; 