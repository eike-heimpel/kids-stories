import type { AIAssistRequest, EntitySchema, SchemaProperty } from '../types';
import { AIService } from '../AIService';
import type { Character } from '../../mongodb/types';

export class CharacterAIService extends AIService {
    protected getEntitySchema(): EntitySchema {
        return {
            type: 'object',
            description: 'A character within a story universe',
            required: ['name', 'description', 'llmContext', 'universeId'],
            properties: {
                name: {
                    type: 'string',
                    description: 'The name of the character'
                },
                description: {
                    type: 'string',
                    description: 'A general description of the character'
                },
                llmContext: {
                    type: 'object',
                    description: 'Context information for AI processing',
                    required: ['shortDescription'],
                    properties: this.getLLMContextSchema()
                },
                mainCharacter: {
                    type: 'boolean',
                    description: 'Whether this is a main character in the story'
                },
                status: {
                    type: 'string',
                    description: 'Current status of the character',
                    enum: ['alive', 'deceased', 'unknown']
                },
                backstory: {
                    type: 'string',
                    description: 'The character\'s background story'
                },
                traits: {
                    type: 'array',
                    description: 'Character personality traits and characteristics',
                    items: {
                        type: 'string',
                        description: 'A character trait'
                    }
                },
                age: {
                    type: 'number',
                    description: 'The character\'s age'
                },
                species: {
                    type: 'string',
                    description: 'The character\'s species or race'
                },
                abilities: {
                    type: 'array',
                    description: 'Special abilities or skills of the character',
                    items: {
                        type: 'string',
                        description: 'An ability or skill'
                    }
                },
                tags: {
                    type: 'array',
                    description: 'Tags associated with the character',
                    items: {
                        type: 'string',
                        description: 'A tag describing the character'
                    }
                },
                relationships: {
                    type: 'array',
                    description: 'Character relationships with other characters',
                    items: {
                        type: 'object',
                        description: 'A relationship between two characters',
                        required: ['characterId', 'relationshipType', 'description'],
                        properties: {
                            characterId: {
                                type: 'string',
                                description: 'ID of the related character'
                            },
                            relationshipType: {
                                type: 'string',
                                description: 'Type of relationship'
                            },
                            description: {
                                type: 'string',
                                description: 'Description of the relationship'
                            }
                        }
                    }
                }
            }
        };
    }

    protected validateEntitySpecificFields(response: Record<string, any>): boolean {
        try {
            // Validate arrays if present
            if ('traits' in response) {
                if (!Array.isArray(response.traits)) {
                    console.error('traits must be an array');
                    return false;
                }
                if (!response.traits.every((t: unknown) => typeof t === 'string')) {
                    console.error('All traits must be strings');
                    return false;
                }
            }

            if ('abilities' in response) {
                if (!Array.isArray(response.abilities)) {
                    console.error('abilities must be an array');
                    return false;
                }
                if (!response.abilities.every((a: unknown) => typeof a === 'string')) {
                    console.error('All abilities must be strings');
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

            // Validate relationships if present
            if ('relationships' in response) {
                if (!Array.isArray(response.relationships)) {
                    console.error('relationships must be an array');
                    return false;
                }
                for (const rel of response.relationships) {
                    if (typeof rel !== 'object' || !rel) {
                        console.error('Each relationship must be an object');
                        return false;
                    }
                    if (!rel.characterId || typeof rel.characterId !== 'string') {
                        console.error('Each relationship must have a characterId string');
                        return false;
                    }
                    if (!rel.relationshipType || typeof rel.relationshipType !== 'string') {
                        console.error('Each relationship must have a relationshipType string');
                        return false;
                    }
                    if (!rel.description || typeof rel.description !== 'string') {
                        console.error('Each relationship must have a description string');
                        return false;
                    }
                }
            }

            // Validate status if present
            if ('status' in response) {
                if (!['alive', 'deceased', 'unknown'].includes(response.status)) {
                    console.error('Invalid status value');
                    return false;
                }
            }

            // Validate mainCharacter if present
            if ('mainCharacter' in response && typeof response.mainCharacter !== 'boolean') {
                console.error('mainCharacter must be a boolean');
                return false;
            }

            // Validate age if present
            if ('age' in response && typeof response.age !== 'number') {
                console.error('age must be a number');
                return false;
            }

            // Validate string fields if present
            const optionalStringFields = ['name', 'description', 'backstory', 'species'];
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
        const character = currentData as Character | undefined;

        let formattedPrompt = `Task: ${prompt}\n\n`;

        if (character) {
            formattedPrompt += `Current Character:\n`;
            formattedPrompt += `Name: ${character.name}\n`;
            formattedPrompt += `Description: ${character.description}\n`;

            if (character.backstory) {
                formattedPrompt += `Backstory: ${character.backstory}\n`;
            }
            if (character.traits?.length) {
                formattedPrompt += `Traits: ${character.traits.join(', ')}\n`;
            }
            if (character.species) {
                formattedPrompt += `Species: ${character.species}\n`;
            }
            if (character.abilities?.length) {
                formattedPrompt += `Abilities: ${character.abilities.join(', ')}\n`;
            }
            if (character.status) {
                formattedPrompt += `Status: ${character.status}\n`;
            }
            if (character.mainCharacter !== undefined) {
                formattedPrompt += `Main Character: ${character.mainCharacter ? 'Yes' : 'No'}\n`;
            }
            if (character.age !== undefined) {
                formattedPrompt += `Age: ${character.age}\n`;
            }
            if (character.tags?.length) {
                formattedPrompt += `Tags: ${character.tags.join(', ')}\n`;
            }
            if (character.relationships?.length) {
                formattedPrompt += `\nRelationships:\n`;
                character.relationships.forEach(rel => {
                    formattedPrompt += `- ${rel.relationshipType}: ${rel.description}\n`;
                });
            }
        }

        return formattedPrompt;
    }
} 