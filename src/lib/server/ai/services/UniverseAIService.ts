import type { AIAssistRequest, EntitySchema, SchemaProperty } from '../types';
import { AIService } from '../AIService';
import type { Universe } from '../../mongodb/types';

export class UniverseAIService extends AIService {
    protected getEntitySchema(): EntitySchema {
        return {
            type: 'object',
            description: 'A story universe with its associated context and metadata',
            required: ['name', 'description', 'llmContext'],
            properties: {
                name: {
                    type: 'string',
                    description: 'The name of the universe'
                },
                description: {
                    type: 'string',
                    description: 'A general description of the universe'
                },
                llmContext: {
                    type: 'object',
                    description: 'Context information for AI processing',
                    required: ['shortDescription'],
                    properties: this.getLLMContextSchema()
                },
                genre: {
                    type: 'array',
                    description: 'Genres that describe this universe',
                    items: {
                        type: 'string',
                        description: 'A genre category'
                    }
                },
                targetAgeRange: {
                    type: 'object',
                    description: 'Target age range for the universe. Both min and max must be provided, and max must be greater than or equal to min.',
                    required: ['min', 'max'],
                    properties: {
                        min: {
                            type: 'number',
                            description: 'Minimum target age. Must be a positive number.'
                        },
                        max: {
                            type: 'number',
                            description: 'Maximum target age. Must be greater than or equal to the minimum age.'
                        }
                    }
                },
                tags: {
                    type: 'array',
                    description: 'Tags associated with the universe',
                    items: {
                        type: 'string',
                        description: 'A tag describing the universe'
                    }
                },
                language: {
                    type: 'string',
                    description: 'The primary language of the universe content'
                }
            }
        };
    }

    protected validateEntitySpecificFields(response: Record<string, any>): boolean {
        try {
            // Validate arrays if present
            if ('genre' in response) {
                if (!Array.isArray(response.genre)) {
                    console.error('genre must be an array');
                    return false;
                }
                if (!response.genre.every((g: unknown) => typeof g === 'string')) {
                    console.error('All genre entries must be strings');
                    return false;
                }
            }

            if ('tags' in response) {
                if (!Array.isArray(response.tags)) {
                    console.error('tags must be an array');
                    return false;
                }
                if (!response.tags.every((tag: unknown) => typeof tag === 'string')) {
                    console.error('All tags must be strings');
                    return false;
                }
            }

            // Validate targetAgeRange if present
            if (response.targetAgeRange) {
                const { min, max } = response.targetAgeRange;
                if (typeof min !== 'number' || typeof max !== 'number') {
                    console.error('Age range values must be numbers');
                    return false;
                }
                if (min < 0 || max < min) {
                    console.error('Invalid age range values');
                    return false;
                }
            }

            // Validate string fields if present
            const optionalStringFields = ['name', 'description', 'language'];
            for (const field of optionalStringFields) {
                if (field in response && typeof response[field] !== 'string') {
                    console.error(`${field} must be a string if provided`);
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }

    protected formatEntitySpecificPrompt(request: AIAssistRequest): string {
        const { prompt, currentData } = request;
        const universe = currentData as Universe | undefined;

        let formattedPrompt = `Task: ${prompt}\n\n`;

        if (universe) {
            formattedPrompt += `Current Universe:\n`;
            formattedPrompt += `Name: ${universe.name}\n`;
            formattedPrompt += `Description: ${universe.description}\n`;

            if (universe.language) {
                formattedPrompt += `Language (ONLY RESPOND IN THIS LANGUAGE): ${universe.language}\n`;
            }
            if (universe.genre?.length) {
                formattedPrompt += `Genres: ${universe.genre.join(', ')}\n`;
            }
            if (universe.tags?.length) {
                formattedPrompt += `Tags: ${universe.tags.join(', ')}\n`;
            }
        }

        return formattedPrompt;
    }
}