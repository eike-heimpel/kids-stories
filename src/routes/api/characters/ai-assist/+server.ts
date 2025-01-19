import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CharacterAIService } from '$lib/server/ai/services/CharacterAIService';
import type { AIAssistRequest } from '$lib/server/ai/types';
import { error } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$env/static/private';
import { CharacterService } from '$lib/server/mongodb/services/CharacterService';
import { ObjectId } from 'mongodb';

const aiService = new CharacterAIService({
    apiKey: OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview'
});

const characterService = new CharacterService();

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
    try {
        const requestData = await request.json();

        // Validate request data
        if (!requestData.prompt) {
            throw error(400, 'Prompt is required');
        }

        // Fetch character data if characterId is provided
        let characterContext = undefined;
        if (requestData.characterId) {
            try {
                characterContext = await characterService.findById(new ObjectId(requestData.characterId));
                if (!characterContext) {
                    console.warn(`Character with ID ${requestData.characterId} not found`);
                }
            } catch (err) {
                console.error('Error fetching character:', err);
            }
        }

        const aiRequest: AIAssistRequest = {
            entityType: 'character',
            prompt: requestData.prompt,
            currentData: requestData.currentData,
            quickAdjustments: requestData.quickAdjustments,
            additionalContext: {
                ...requestData.additionalContext,
                character: characterContext // Include the character context
            }
        };

        const result = await aiService.processAIAssist(aiRequest);

        return json(result);
    } catch (err) {
        console.error('AI Assist API Error:', err);
        throw error(500, 'Failed to process AI assist request');
    }
}; 