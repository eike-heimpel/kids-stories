import OpenAI from 'openai';
import type {
    AIAssistRequest,
    AIAssistResponse,
    AIServiceConfig,
    EntitySchema,
    SchemaProperty
} from './types';
import { error } from '@sveltejs/kit';

export abstract class AIService {
    protected openai: OpenAI;
    protected config: AIServiceConfig;

    constructor(config: AIServiceConfig) {
        this.config = {
            temperature: 0.7,
            maxTokens: 2000,
            ...config
        };
        this.openai = new OpenAI({
            apiKey: this.config.apiKey
        });
    }

    // Abstract methods that must be implemented by entity-specific services
    protected abstract getEntitySchema(): EntitySchema;
    protected abstract validateResponse(response: Record<string, any>): boolean;
    protected abstract formatPrompt(request: AIAssistRequest): string;

    async processAIAssist(request: AIAssistRequest): Promise<AIAssistResponse> {
        try {
            // Step 1: Determine which fields to update
            const { fieldsToUpdate, reasoning } = await this.identifyFieldsToUpdate(request);

            // Step 2: Generate content for the identified fields
            const updatedFields = await this.generateFieldContent(request, fieldsToUpdate);

            return {
                fieldsToUpdate,
                updatedFields,
                reasoning,
                suggestedFollowUp: this.generateFollowUpSuggestions(fieldsToUpdate, updatedFields)
            };
        } catch (err) {
            console.error('AI Assist Error:', err);
            throw error(500, 'Failed to process AI assist request');
        }
    }

    protected async identifyFieldsToUpdate(request: AIAssistRequest): Promise<{ fieldsToUpdate: string[], reasoning: string }> {
        const fieldSelectionSchema: EntitySchema = {
            type: 'object',
            description: 'Fields to update based on the user prompt',
            required: ['fieldsToUpdate', 'reasoning'],
            properties: {
                fieldsToUpdate: {
                    type: 'array',
                    description: 'List of fields that should be updated',
                    items: {
                        type: 'string',
                        description: 'Field name to update',
                        enum: Object.keys(this.getEntitySchema().properties)
                    }
                },
                reasoning: {
                    type: 'string',
                    description: 'Explanation for why these fields were selected'
                }
            }
        };

        const response = await this.openai.chat.completions.create({
            model: this.config.model,
            temperature: 0.2, // Lower temperature for more deterministic field selection
            max_tokens: this.config.maxTokens,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful AI that identifies which fields should be updated based on user prompts. Only select fields that are directly relevant to the user\'s request.'
                },
                {
                    role: 'user',
                    content: this.formatPrompt(request)
                }
            ],
            functions: [{
                name: 'select_fields',
                description: 'Select fields to update based on the user prompt',
                parameters: fieldSelectionSchema as any // Type assertion needed for OpenAI's function parameters
            }],
            function_call: { name: 'select_fields' }
        });

        const functionCall = response.choices[0]?.message?.function_call;
        if (!functionCall?.arguments) {
            throw new Error('Invalid field selection response');
        }
        console.log('Field selection response:', functionCall.arguments);
        return JSON.parse(functionCall.arguments);
    }

    protected async generateFieldContent(
        request: AIAssistRequest,
        fieldsToUpdate: string[]
    ): Promise<Record<string, any>> {
        // Create a schema that only includes the fields we want to update
        const restrictedSchema = this.createRestrictedSchema(fieldsToUpdate);

        const response = await this.openai.chat.completions.create({
            model: this.config.model,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful AI that generates content for ${request.entityType} fields. Only generate content for the specified fields.`
                },
                {
                    role: 'user',
                    content: `Generate content for these fields: ${JSON.stringify(fieldsToUpdate)}
                    Original prompt: ${request.prompt}
                    Current data: ${JSON.stringify(request.currentData)}
                    Quick adjustments: ${JSON.stringify(request.quickAdjustments)}
                    Additional context: ${JSON.stringify(request.additionalContext)}`
                }
            ],
            functions: [{
                name: 'generate_content',
                description: 'Generate content for the specified fields',
                parameters: restrictedSchema as any // Type assertion needed for OpenAI's function parameters
            }],
            function_call: { name: 'generate_content' }
        });

        const functionCall = response.choices[0]?.message?.function_call;
        if (!functionCall?.arguments) {
            throw new Error('Invalid content generation response');
        }

        const generatedContent = JSON.parse(functionCall.arguments);
        console.log('Generated content:', generatedContent);
        if (!this.validateResponse(generatedContent)) {
            throw new Error('Generated content failed validation');
        }

        return generatedContent;
    }

    protected createRestrictedSchema(fieldsToUpdate: string[]): EntitySchema {
        const fullSchema = this.getEntitySchema();
        const restrictedProperties: Record<string, SchemaProperty> = {};

        // Only include the fields we want to update
        for (const field of fieldsToUpdate) {
            if (fullSchema.properties[field]) {
                restrictedProperties[field] = fullSchema.properties[field];
            }
        }

        return {
            type: 'object',
            description: 'Schema for generating content for selected fields',
            required: fieldsToUpdate,
            properties: restrictedProperties
        };
    }

    protected generateFollowUpSuggestions(
        fieldsToUpdate: string[],
        updatedFields: Record<string, any>
    ): string[] {
        // Basic follow-up suggestions based on updated fields
        const suggestions: string[] = [];

        if (fieldsToUpdate.length > 0) {
            suggestions.push('Would you like to refine any of the generated content?');
        }

        // Add field-specific suggestions
        fieldsToUpdate.forEach(field => {
            suggestions.push(`Would you like to add more details to the ${field}?`);
        });

        return suggestions;
    }
}