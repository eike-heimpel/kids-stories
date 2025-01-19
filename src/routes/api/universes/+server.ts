import { json } from '@sveltejs/kit';
import { UniverseService } from '$lib/server/mongodb/services/UniverseService';

const universeService = new UniverseService();

export async function GET({ url, locals }) {
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const userId = locals.user?.id;
    const search = url.searchParams.get('search');
    const genre = url.searchParams.get('genre');
    const tag = url.searchParams.get('tag');

    let result;

    if (search) {
        result = await universeService.search(search, page, limit);
    } else if (genre) {
        result = await universeService.findByGenre(genre, page, limit);
    } else if (tag) {
        result = await universeService.findByTag(tag, page, limit);
    } else {
        result = userId
            ? await universeService.findAccessible(userId, page, limit)
            : await universeService.findPublic(page, limit);
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
    if (!data.name || !data.description) {
        return new Response('Missing required fields', { status: 400 });
    }

    try {
        const universe = await universeService.create({
            ...data,
            creatorId: userId,
            lastModifiedBy: userId,
            version: 1,
            // Ensure llmContext exists
            llmContext: {
                shortDescription: data.llmContext?.shortDescription || data.description.substring(0, 100),
                ...data.llmContext
            }
        });

        return json(universe);
    } catch (error) {
        console.error('Error creating universe:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}