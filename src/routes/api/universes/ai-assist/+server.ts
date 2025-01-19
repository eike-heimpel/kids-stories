import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UniverseAIService } from '$lib/server/ai/services/UniverseAIService';
import type { AIAssistRequest } from '$lib/server/ai/types';
import { error } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$env/static/private';
import { UniverseService } from '$lib/server/mongodb/services/UniverseService';
import { ObjectId } from 'mongodb';

const aiService = new UniverseAIService({
    apiKey: OPENAI_API_KEY || '',
    model: 'gpt-4o-mini'
});

const universeService = new UniverseService();

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
    try {
        const requestData = await request.json();

        // Validate request data
        if (!requestData.prompt) {
            throw error(400, 'Prompt is required');
        }

        // Fetch universe data if universeId is provided
        let universeContext = undefined;
        if (requestData.universeId) {
            try {
                universeContext = await universeService.findById(new ObjectId(requestData.universeId));
                if (!universeContext) {
                    console.warn(`Universe with ID ${requestData.universeId} not found`);
                }
            } catch (err) {
                console.error('Error fetching universe:', err);
            }
        }

        const aiRequest: AIAssistRequest = {
            entityType: 'universe',
            prompt: requestData.prompt,
            currentData: requestData.currentData,
            quickAdjustments: requestData.quickAdjustments,
            additionalContext: {
                ...requestData.additionalContext,
                universe: universeContext // Include the universe context
            }
        };

        const result = await aiService.processAIAssist(aiRequest);

        return json(result);
    } catch (err) {
        console.error('AI Assist API Error:', err);
        throw error(500, 'Failed to process AI assist request');
    }
};