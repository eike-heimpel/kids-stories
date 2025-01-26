import type { AIAssistRequest, EntitySchema } from '../types';
import { AIService } from '../AIService';
import type { Plot } from '../../mongodb/types';
import type { AIServiceConfig } from '../types';

export class PlotAIService extends AIService {
    constructor(config: AIServiceConfig) {
        super(config);
    }

    protected getEntitySchema(): EntitySchema {
        return {
            type: 'object',
            description: 'A plot within a story universe',
            required: ['title', 'summary', 'llmContext', 'universeId'],
            properties: {
                title: {
                    type: 'string',
                    description: 'The title of the plot'
                },
                summary: {
                    type: 'string',
                    description: 'A summary of the plot'
                },
                llmContext: {
                    type: 'object',
                    description: 'Context information for AI processing',
                    required: ['shortDescription'],
                    properties: this.getLLMContextSchema()
                },
                timeframe: {
                    type: 'object',
                    description: 'Time period of the plot',
                    required: ['start'],
                    properties: {
                        start: {
                            type: 'string',
                            description: 'When the plot begins'
                        },
                        end: {
                            type: 'string',
                            description: 'When the plot ends (if applicable)'
                        },
                        duration: {
                            type: 'string',
                            description: 'Duration of the plot'
                        }
                    }
                },
                plotPoints: {
                    type: 'array',
                    description: 'Sequence of plot points that make up this plot',
                    items: {
                        type: 'object',
                        description: 'Individual plot point details',
                        required: ['title', 'description', 'order', 'timestamp', 'detailLevel', 'location'],
                        properties: {
                            title: {
                                type: 'string',
                                description: 'Title of the plot point'
                            },
                            description: {
                                type: 'string',
                                description: 'Description of what happens'
                            },
                            order: {
                                type: 'number',
                                description: 'Order in the sequence'
                            },
                            timestamp: {
                                type: 'string',
                                description: 'When this occurs'
                            },
                            detailLevel: {
                                type: 'string',
                                enum: ['major', 'minor'],
                                description: 'Whether this is a major or minor plot point'
                            },
                            location: {
                                type: 'object',
                                description: 'Location information for the plot point',
                                required: ['primary'],
                                properties: {
                                    primary: {
                                        type: 'string',
                                        description: 'Primary location ID'
                                    },
                                    mentioned: {
                                        type: 'array',
                                        items: {
                                            type: 'string',
                                            description: 'Referenced location ID'
                                        },
                                        description: 'Referenced location IDs'
                                    }
                                }
                            },
                            characters: {
                                type: 'array',
                                description: 'Characters involved in this plot point',
                                items: {
                                    type: 'object',
                                    description: 'Character involvement details',
                                    required: ['characterId', 'role'],
                                    properties: {
                                        characterId: {
                                            type: 'string',
                                            description: 'Reference to the character'
                                        },
                                        role: {
                                            type: 'string',
                                            enum: ['active', 'passive', 'mentioned'],
                                            description: 'Character\'s role'
                                        },
                                        actions: {
                                            type: 'array',
                                            items: {
                                                type: 'string',
                                                description: 'Character action'
                                            },
                                            description: 'Character\'s actions'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                status: {
                    type: 'string',
                    enum: ['draft', 'in-progress', 'completed'],
                    description: 'Current status of the plot'
                },
                mainCharacters: {
                    type: 'array',
                    description: 'IDs of main characters in this plot',
                    items: {
                        type: 'string',
                        description: 'Character ID'
                    }
                },
                tags: {
                    type: 'array',
                    description: 'Tags for categorizing the plot',
                    items: {
                        type: 'string',
                        description: 'Tag value'
                    }
                }
            }
        };
    }

    protected validateEntitySpecificFields(response: Record<string, any>): boolean {
        try {
            // Validate timeframe if present
            if ('timeframe' in response) {
                const timeframe = response.timeframe;
                if (typeof timeframe !== 'object' || !timeframe) {
                    console.error('timeframe must be an object');
                    return false;
                }
                if (!timeframe.start) {
                    console.error('timeframe.start is required');
                    return false;
                }
            }

            // Validate plotPoints if present
            if ('plotPoints' in response) {
                if (!Array.isArray(response.plotPoints)) {
                    console.error('plotPoints must be an array');
                    return false;
                }
                for (const point of response.plotPoints) {
                    if (!this.validatePlotPoint(point)) {
                        return false;
                    }
                }
            }

            // Validate status if present
            if ('status' in response) {
                if (!['draft', 'in-progress', 'completed'].includes(response.status)) {
                    console.error('Invalid status value');
                    return false;
                }
            }

            // Validate arrays if present
            if ('mainCharacters' in response) {
                if (!Array.isArray(response.mainCharacters)) {
                    console.error('mainCharacters must be an array');
                    return false;
                }
                if (!response.mainCharacters.every((id: unknown) => typeof id === 'string')) {
                    console.error('All mainCharacters must be strings');
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

            // Validate required string fields if present
            const requiredStringFields = ['title', 'summary'];
            for (const field of requiredStringFields) {
                if (field in response && typeof response[field] !== 'string') {
                    console.error(`${field} must be a string`);
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }

    private validatePlotPoint(point: any): boolean {
        if (typeof point !== 'object' || !point) {
            console.error('Plot point must be an object');
            return false;
        }

        // Validate required fields
        const required = ['title', 'description', 'order', 'timestamp', 'detailLevel', 'location'];
        for (const field of required) {
            if (!(field in point)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        // Validate types
        if (typeof point.title !== 'string' || typeof point.description !== 'string') {
            console.error('title and description must be strings');
            return false;
        }

        if (typeof point.order !== 'number') {
            console.error('order must be a number');
            return false;
        }

        if (!['major', 'minor'].includes(point.detailLevel)) {
            console.error('Invalid detailLevel value');
            return false;
        }

        // Validate location
        if (typeof point.location !== 'object' || !point.location.primary) {
            console.error('Invalid location object');
            return false;
        }

        // Validate arrays if present
        if (point.characters && !Array.isArray(point.characters)) {
            console.error('characters must be an array');
            return false;
        }

        if (point.items && !Array.isArray(point.items)) {
            console.error('items must be an array');
            return false;
        }

        return true;
    }

    protected formatEntitySpecificPrompt(request: AIAssistRequest): string {
        const { currentData } = request;
        const plot = currentData as Plot;

        if (!plot) return '';

        const timeframeStart = plot.timeframe?.start ? new Date(plot.timeframe.start).toISOString() : '';
        const timeframeEnd = plot.timeframe?.end ? new Date(plot.timeframe.end).toISOString() : '';

        return `
Title: ${plot.title || ''}
Summary: ${plot.summary || ''}
Status: ${plot.status || 'draft'}
Timeframe: ${timeframeStart} to ${timeframeEnd}
Duration: ${plot.timeframe?.duration || ''}
Plot Points: ${plot.plotPoints?.length || 0}
Main Characters: ${plot.mainCharacters?.join(', ') || ''}
Tags: ${plot.tags?.join(', ') || ''}
`;
    }
} 