import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UniverseAIService } from '$lib/server/ai/services/UniverseAIService';
import type { AIAssistRequest } from '$lib/server/ai/types';
import { error } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$env/static/private';

const aiService = new UniverseAIService({
    apiKey: OPENAI_API_KEY || '',
    model: 'gpt-4o-mini' // Using the latest model that supports JSON mode
});

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
    try {
        const requestData = await request.json();

        // Validate request data
        if (!requestData.prompt) {
            throw error(400, 'Prompt is required');
        }

        const aiRequest: AIAssistRequest = {
            entityType: 'universe',
            prompt: requestData.prompt,
            currentData: requestData.currentData,
            quickAdjustments: requestData.quickAdjustments,
            additionalContext: requestData.additionalContext
        };

        const result = await aiService.processAIAssist(aiRequest);

        return json(result);
    } catch (err) {
        console.error('AI Assist API Error:', err);
        throw error(500, 'Failed to process AI assist request');
    }
};