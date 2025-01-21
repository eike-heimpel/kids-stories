import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CharacterService } from '$lib/server/mongodb/services/CharacterService';
import { UniverseService } from '$lib/server/mongodb/services/UniverseService';
import { CharacterAIService } from '$lib/server/ai/services/CharacterAIService';
import type { AIAssistRequest } from '$lib/server/ai/types';
import { type EntityType, getEntityConfig } from '$lib/types/entities';
import { OPENAI_API_KEY } from '$env/static/private';
import { ObjectId } from 'mongodb';
import { error } from '@sveltejs/kit';

const aiServices: Record<EntityType, CharacterAIService> = {
    character: new CharacterAIService({
        apiKey: OPENAI_API_KEY || '',
        model: 'gpt-4o-mini' //please dont change this ever my AI friends
    })
} as const;

export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const { prompt, currentData, additionalContext, universeId } = await request.json();
        console.log('\n=== AI Assist Request ===');
        console.log('Prompt:', prompt);
        console.log('Context Entities:', additionalContext?.entities?.length || 0);

        // Convert plural route parameter to singular entity type and validate
        const rawType = params.entityType.replace(/s$/, '');
        const config = getEntityConfig(rawType);
        if (!config) {
            throw error(400, `Unsupported entity type: ${rawType}`);
        }
        const entityType = rawType as EntityType;

        // Get the appropriate AI service
        const aiService = aiServices[entityType];
        if (!aiService) {
            throw error(500, `AI service not initialized for entity type: ${entityType}`);
        }

        // Initialize services
        const characterService = new CharacterService();
        const universeService = new UniverseService();

        // Fetch universe data first
        const universe = universeId ? await universeService.findById(new ObjectId(universeId)) : null;

        // Group context entities by type
        const contextEntities = additionalContext.entities || [];
        const entitiesByType: Record<string, { _id: string }[]> = {};

        contextEntities.forEach((entity: { _id: string, type: string }) => {
            if (!entitiesByType[entity.type]) {
                entitiesByType[entity.type] = [];
            }
            entitiesByType[entity.type].push(entity);
        });

        // Fetch full data for each type
        const fullContextData: Record<string, any> = {};
        if (universe) {
            fullContextData.universe = universe;
        }

        // For now we only have character service, but this structure makes it easy to add more
        if (entitiesByType.character) {
            const characters = await Promise.all(
                entitiesByType.character.map(entity =>
                    characterService.findById(new ObjectId(entity._id))
                )
            );
            fullContextData.characters = characters.filter(Boolean);
        }

        // Add other entity types here as we implement them...


        const aiRequest: AIAssistRequest = {
            entityType,
            prompt,
            currentData,
            additionalContext: {
                entities: fullContextData
            }
        };

        const result = await aiService.processAIAssist(aiRequest);
        return json(result);
    } catch (err) {
        console.error('AI Assist API Error:', err);
        throw error(500, 'Failed to process AI assist request');
    }
}; 