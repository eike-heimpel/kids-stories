import { json } from '@sveltejs/kit';
import { CharacterService } from '$lib/server/mongodb/services/CharacterService';
import { UniverseService } from '$lib/server/mongodb/services/UniverseService';
import { checkUniverseAccess, checkCharacterAccess } from '$lib/server/auth/guards';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';

const characterService = new CharacterService();
const universeService = new UniverseService();

export const PUT: RequestHandler = async ({ request, params, locals }) => {
    const { characterId } = params;
    const userId = locals.user?.id;

    try {
        const data = await request.json();
        const character = await characterService.findById(new ObjectId(characterId));

        if (!character) {
            return new Response('Character not found', { status: 404 });
        }

        // Check access
        checkCharacterAccess(character, userId);

        // Remove fields that shouldn't be updated directly
        const { _id, createdAt, updatedAt, version, ...updateData } = data;

        // Update character
        const updatedCharacter = await characterService.update(new ObjectId(characterId), {
            ...updateData,
            lastModifiedBy: userId
        });

        if (!updatedCharacter || !updatedCharacter._id) {
            return new Response('Failed to update character', { status: 500 });
        }

        // Convert ObjectId to string for serialization
        return json({
            ...updatedCharacter,
            _id: updatedCharacter._id.toString()
        });
    } catch (error) {
        console.error('Error updating character:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
    const { universeId, characterId } = params;
    const userId = locals.user?.id;

    // Verify universe access
    const universe = await universeService.findById(new ObjectId(universeId));
    checkUniverseAccess(universe, userId);

    // Verify character exists and belongs to universe
    const existingCharacter = await characterService.findById(new ObjectId(characterId));
    if (!existingCharacter || existingCharacter.universeId !== universeId) {
        return new Response('Character not found in this universe', { status: 404 });
    }

    // Verify character access
    checkCharacterAccess(existingCharacter, userId);

    try {
        const success = await characterService.delete(new ObjectId(characterId));
        if (!success) {
            return new Response('Failed to delete character', { status: 500 });
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting character:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}; 