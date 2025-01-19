import { json } from '@sveltejs/kit';
import { CharacterService } from '$lib/server/mongodb/services/CharacterService';

const characterService = new CharacterService();

export async function GET({ url, locals }) {
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const universeId = url.searchParams.get('universeId');
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const species = url.searchParams.get('species');
    const tag = url.searchParams.get('tag');
    const mainCharactersOnly = url.searchParams.get('mainCharactersOnly') === 'true';

    if (!universeId) {
        return new Response('Universe ID is required', { status: 400 });
    }

    let result;

    if (search) {
        result = await characterService.search(universeId, search, page, limit);
    } else if (status) {
        result = await characterService.findByStatus(universeId, status as any, page, limit);
    } else if (species) {
        result = await characterService.findBySpecies(universeId, species, page, limit);
    } else if (tag) {
        result = await characterService.findByTag(universeId, tag, page, limit);
    } else if (mainCharactersOnly) {
        result = await characterService.findMainCharacters(universeId, page, limit);
    } else {
        result = await characterService.findByUniverse(universeId, page, limit);
    }

    return json(result);
}

export async function POST({ request, locals }) {
    const data = await request.json();
    const userId = locals.user?.id;

    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Ensure required fields are present
    if (!data.name || !data.description || !data.universeId) {
        return new Response('Missing required fields', { status: 400 });
    }

    try {
        const character = await characterService.create({
            ...data,
            lastModifiedBy: userId,
            version: 1,
            // Ensure llmContext exists
            llmContext: {
                shortDescription: data.llmContext?.shortDescription || data.description.substring(0, 100),
                ...data.llmContext
            }
        });

        return json(character);
    } catch (error) {
        console.error('Error creating character:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
} 