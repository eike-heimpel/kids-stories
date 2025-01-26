import { json } from '@sveltejs/kit';
import { PlotService } from '$lib/server/mongodb/services/PlotService';
import { UniverseService } from '$lib/server/mongodb/services/UniverseService';
import { checkUniverseAccess } from '$lib/server/auth/guards';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';

const plotService = new PlotService();
const universeService = new UniverseService();

export const POST: RequestHandler = async ({ request, params, locals }) => {
    const universeId = params.universeId;
    const userId = locals.user?.id;

    // Verify universe access
    const universe = await universeService.findById(new ObjectId(universeId));
    checkUniverseAccess(universe, userId);

    try {
        const data = await request.json();

        // Ensure required fields based on plot schema
        if (!data.title || !data.summary) {
            return new Response('Missing required fields', { status: 400 });
        }

        // Create plot with universe and creator info
        const plot = await plotService.create({
            ...data,
            universeId,
            creatorId: userId,
            // Ensure llmContext exists with shortDescription
            llmContext: {
                shortDescription: data.llmContext?.shortDescription || data.summary.substring(0, 100),
                ...data.llmContext
            },
            // Ensure default values
            status: data.status || 'draft',
            plotPoints: data.plotPoints || [],
            mainCharacters: data.mainCharacters || [],
            tags: data.tags || []
        });

        // Convert ObjectId to string for serialization
        return json({
            ...plot,
            _id: plot._id?.toString()
        });
    } catch (error) {
        console.error('Error creating plot:', error);
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

        const plots = await plotService.findByUniverse(universeId, page, limit);
        return json(plots);
    } catch (error) {
        console.error('Error fetching plots:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}; 