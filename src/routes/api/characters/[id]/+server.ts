import { json } from '@sveltejs/kit';
import { CharacterService } from '$lib/server/mongodb/services/CharacterService';
import { ObjectId } from 'mongodb';

const characterService = new CharacterService();

export async function GET({ params }) {
    try {
        const character = await characterService.findById(new ObjectId(params.id));
        if (!character) {
            return new Response('Character not found', { status: 404 });
        }
        return json(character);
    } catch (error) {
        console.error('Error fetching character:', error);
        return new Response('Invalid character ID', { status: 400 });
    }
}

export async function PUT({ params, request, locals }) {
    const userId = locals.user?.id;

    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const data = await request.json();
        const existingCharacter = await characterService.findById(new ObjectId(params.id));

        if (!existingCharacter) {
            return new Response('Character not found', { status: 404 });
        }

        // Check if user has permission to edit
        if (existingCharacter.lastModifiedBy !== userId) {
            return new Response('Forbidden', { status: 403 });
        }

        // Ensure required fields are present
        if (!data.name || !data.description) {
            return new Response('Missing required fields', { status: 400 });
        }

        const character = await characterService.update(new ObjectId(params.id), {
            ...data,
            lastModifiedBy: userId,
            version: existingCharacter.version + 1,
            // Preserve universe ID
            universeId: existingCharacter.universeId,
            // Ensure llmContext exists
            llmContext: {
                shortDescription: data.llmContext?.shortDescription || data.description.substring(0, 100),
                ...data.llmContext
            }
        });

        return json(character);
    } catch (error) {
        console.error('Error updating character:', error);
        if (error instanceof Error && error.message.includes('Invalid ObjectId')) {
            return new Response('Invalid character ID', { status: 400 });
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
        const existingCharacter = await characterService.findById(new ObjectId(params.id));

        if (!existingCharacter) {
            return new Response('Character not found', { status: 404 });
        }

        // Check if user has permission to delete
        if (existingCharacter.lastModifiedBy !== userId) {
            return new Response('Forbidden', { status: 403 });
        }

        const success = await characterService.delete(new ObjectId(params.id));
        if (!success) {
            return new Response('Failed to delete character', { status: 500 });
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting character:', error);
        if (error instanceof Error && error.message.includes('Invalid ObjectId')) {
            return new Response('Invalid character ID', { status: 400 });
        }
        return new Response('Internal Server Error', { status: 500 });
    }
} 