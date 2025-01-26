import { json } from '@sveltejs/kit';
import { CharacterService } from '$lib/server/mongodb/services/CharacterService';
import { UniverseService } from '$lib/server/mongodb/services/UniverseService';
import { checkUniverseAccess } from '$lib/server/auth/guards';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';

const characterService = new CharacterService();
const universeService = new UniverseService();

export const POST: RequestHandler = async ({ request, params, locals }) => {
    const universeId = params.universeId;
    const userId = locals.user?.id;

    // Verify universe access
    const universe = await universeService.findById(new ObjectId(universeId));
    checkUniverseAccess(universe, userId);

    try {
        const data = await request.json();

        // Ensure required fields
        if (!data.name || !data.description) {
            return new Response('Missing required fields', { status: 400 });
        }

        // Create character with universe and creator info
        const character = await characterService.create({
            ...data,
            universeId,
            creatorId: userId,
            // Ensure llmContext exists
            llmContext: {
                shortDescription: data.llmContext?.shortDescription || data.description.substring(0, 100),
                ...data.llmContext
            }
        });

        // Convert ObjectId to string for serialization
        return json({
            ...character,
            _id: character._id?.toString()
        });
    } catch (error) {
        console.error('Error creating character:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const GET: RequestHandler = async ({ params, locals, url }) => {
    const universeId = params.universeId;
    const userId = locals.user?.id;

    // Verify universe access
    const universe = await universeService.findById(new ObjectId(universeId));
    checkUniverseAccess(universe, userId);

    try {
        // Get query parameters
        const page = Number(url.searchParams.get('page')) || 1;
        const limit = Number(url.searchParams.get('limit')) || 10;

        const characters = await characterService.findByUniverse(universeId, page, limit);
        return json(characters);
    } catch (error) {
        console.error('Error fetching characters:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}; 