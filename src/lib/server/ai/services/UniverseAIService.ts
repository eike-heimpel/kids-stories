import type { AIAssistRequest, EntitySchema, SchemaProperty } from '../types';
import { AIService } from '../AIService';
import type { Universe } from '../../mongodb/types';

export class UniverseAIService extends AIService {
    protected getEntitySchema(): EntitySchema {
        const llmContextProperties: Record<string, SchemaProperty> = {
            shortDescription: {
                type: 'string',
                description: 'A brief essence of the universe for simple queries'
            },
            longDescription: {
                type: 'string',
                description: 'Detailed context for deep dives into the universe'
            },
            keyPoints: {
                type: 'array',
                description: 'Crucial bullet points about the universe',
                items: {
                    type: 'string',
                    description: 'A key point about the universe'
                }
            },
            relationships: {
                type: 'string',
                description: 'Connections to other elements in the universe'
            },
            hiddenInformation: {
                type: 'string',
                description: 'Non-obvious but important details about the universe'
            },
            storyImplications: {
                type: 'string',
                description: 'Story impact and potential of the universe'
            },
            tone: {
                type: 'string',
                description: 'Emotional/atmospheric notes about the universe'
            },
            systemNotes: {
                type: 'string',
                description: 'Special LLM instructions for the universe'
            }
        };

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
                    properties: llmContextProperties
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

    protected validateResponse(response: Record<string, any>): boolean {
        // Validate that all fields present are of correct type
        try {
            // Validate llmContext if present
            if (response.llmContext) {
                if (typeof response.llmContext !== 'object') {
                    return false;
                }

                // If shortDescription is present, it must be a string
                if ('shortDescription' in response.llmContext &&
                    typeof response.llmContext.shortDescription !== 'string') {
                    return false;
                }

                // Optional fields type validation
                if ('keyPoints' in response.llmContext &&
                    !Array.isArray(response.llmContext.keyPoints)) {
                    return false;
                }
            }

            // Validate arrays if present
            if ('genre' in response && !Array.isArray(response.genre)) {
                return false;
            }
            if ('tags' in response && !Array.isArray(response.tags)) {
                return false;
            }

            // Validate targetAgeRange if present
            if (response.targetAgeRange) {
                const { min, max } = response.targetAgeRange;
                if (typeof min !== 'number' || typeof max !== 'number' || min > max) {
                    return false;
                }
            }

            // Validate string fields if present
            if ('name' in response && typeof response.name !== 'string') {
                return false;
            }
            if ('description' in response && typeof response.description !== 'string') {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }

    protected formatPrompt(request: AIAssistRequest): string {
        const { prompt, currentData, quickAdjustments } = request;
        const universe = currentData as Universe | undefined;

        let formattedPrompt = `Task: ${prompt}\n\n`;
        console.log(universe);
        if (universe) {
            console.log(universe);
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
            formattedPrompt += `\nLLM Context:\n`;
            formattedPrompt += `Short Description: ${universe.llmContext.shortDescription}\n`;
            if (universe.llmContext.longDescription) {
                formattedPrompt += `Long Description: ${universe.llmContext.longDescription}\n`;
            }
            // Add other LLM context fields as needed
        }

        if (quickAdjustments?.length) {
            formattedPrompt += `\nRequested Adjustments:\n`;
            formattedPrompt += quickAdjustments.join('\n');
        }

        return formattedPrompt;
    }
}