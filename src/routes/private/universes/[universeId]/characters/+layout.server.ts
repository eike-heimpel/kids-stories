import { CharacterService } from '$lib/server/mongodb/services/CharacterService';
import type { LayoutServerLoad } from './$types';
import type { Character } from '$lib/server/mongodb/types';
import { error } from '@sveltejs/kit';

const characterService = new CharacterService();

export const load: LayoutServerLoad = async ({ params, parent }) => {
    const parentData = await parent();
    const universe = parentData.universe;

    if (!universe?._id) {
        throw error(404, 'Universe not found');
    }

    // Load characters for this universe
    const result = await characterService.findByUniverse(universe._id.toString());

    // Convert ObjectIds to strings for serialization
    return {
        characters: result.items.map((char: Character) => ({
            ...char,
            _id: char._id?.toString()
        }))
    };
}; 