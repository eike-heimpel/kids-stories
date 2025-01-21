import { json } from '@sveltejs/kit';
import { UniverseService } from '$lib/server/mongodb/services/UniverseService';
import { ObjectId } from 'mongodb';

const universeService = new UniverseService();

export async function GET({ params }) {
    try {
        const universe = await universeService.findById(new ObjectId(params.id));
        if (!universe) {
            return new Response('Universe not found', { status: 404 });
        }
        return json(universe);
    } catch (error) {
        console.error('Error fetching universe:', error);
        return new Response('Invalid universe ID', { status: 400 });
    }
}

export async function PUT({ params, request, locals }) {
    const userId = locals.user?.id;

    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const data = await request.json();
        const existingUniverse = await universeService.findById(new ObjectId(params.id));

        if (!existingUniverse) {
            return new Response('Universe not found', { status: 404 });
        }

        // Check if user has permission to edit
        if (existingUniverse.creatorId !== userId &&
            !existingUniverse.collaborators?.includes(userId)) {
            return new Response('Forbidden', { status: 403 });
        }

        // Ensure required fields are present
        if (!data.name || !data.description) {
            return new Response('Missing required fields', { status: 400 });
        }

        const universe = await universeService.update(new ObjectId(params.id), {
            ...data,
            lastModifiedBy: userId,
            creatorId: existingUniverse.creatorId,
            llmContext: {
                shortDescription: data.llmContext?.shortDescription || data.description.substring(0, 100),
                ...data.llmContext
            }
        });

        return json(universe);
    } catch (error) {
        console.error('Error updating universe:', error);
        if (error instanceof Error && error.message.includes('Invalid ObjectId')) {
            return new Response('Invalid universe ID', { status: 400 });
        }
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function DELETE({ params, locals }) {
    const userId = locals.user?.id;

    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const existingUniverse = await universeService.findById(new ObjectId(params.id));

        if (!existingUniverse) {
            return new Response('Universe not found', { status: 404 });
        }

        // Check if user has permission to delete
        if (existingUniverse.creatorId !== userId) {
            return new Response('Forbidden', { status: 403 });
        }

        const success = await universeService.delete(new ObjectId(params.id));
        if (!success) {
            return new Response('Failed to delete universe', { status: 500 });
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting universe:', error);
        if (error instanceof Error && error.message.includes('Invalid ObjectId')) {
            return new Response('Invalid universe ID', { status: 400 });
        }
        return new Response('Internal Server Error', { status: 500 });
    }
}