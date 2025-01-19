import OpenAI from 'openai';
import type {
    AIAssistRequest,
    AIAssistResponse,
    AIServiceConfig,
    EntitySchema,
    SchemaProperty,
    LLMContext
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
    protected abstract validateEntitySpecificFields(response: Record<string, any>): boolean;
    protected abstract formatEntitySpecificPrompt(request: AIAssistRequest): string;

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

    protected getLLMContextSchema(): Record<string, SchemaProperty> {
        return {
            shortDescription: {
                type: 'string',
                description: 'A brief essence of the entity for simple queries'
            },
            longDescription: {
                type: 'string',
                description: 'Detailed context for deep dives'
            },
            keyPoints: {
                type: 'array',
                description: 'Crucial bullet points about the entity',
                items: {
                    type: 'string',
                    description: 'A key point about the entity'
                }
            },
            relationships: {
                type: 'string',
                description: 'Connections to other elements'
            },
            hiddenInformation: {
                type: 'string',
                description: 'Non-obvious but important details'
            },
            storyImplications: {
                type: 'string',
                description: 'Story impact and potential'
            },
            tone: {
                type: 'string',
                description: 'Emotional/atmospheric notes'
            },
            systemNotes: {
                type: 'string',
                description: 'Special LLM instructions'
            }
        };
    }

    protected validateLLMContext(llmContext: any): boolean {
        if (typeof llmContext !== 'object') {
            console.error('LLM Context must be an object');
            return false;
        }

        // Required field
        if (!llmContext.shortDescription || typeof llmContext.shortDescription !== 'string') {
            console.error('Short description is required and must be a string');
            return false;
        }

        // Optional string fields
        const optionalStringFields = [
            'longDescription',
            'relationships',
            'hiddenInformation',
            'storyImplications',
            'tone',
            'systemNotes'
        ];

        for (const field of optionalStringFields) {
            if (field in llmContext && typeof llmContext[field] !== 'string') {
                console.error(`${field} must be a string if provided`);
                return false;
            }
        }

        // Validate keyPoints array if present
        if ('keyPoints' in llmContext) {
            if (!Array.isArray(llmContext.keyPoints)) {
                console.error('keyPoints must be an array');
                return false;
            }
            if (!llmContext.keyPoints.every((point: unknown) => typeof point === 'string')) {
                console.error('All keyPoints must be strings');
                return false;
            }
        }

        return true;
    }

    protected formatLLMContextPrompt(llmContext: LLMContext): string {
        let prompt = '';

        // Start with system notes if they exist
        if (llmContext.systemNotes) {
            prompt += `System Instructions: ${llmContext.systemNotes}\n\n`;
        }

        // Essential context first
        prompt += `Short Description: ${llmContext.shortDescription}\n`;

        if (llmContext.longDescription) {
            prompt += `Detailed Context: ${llmContext.longDescription}\n`;
        }

        // Key information
        if (llmContext.keyPoints?.length) {
            prompt += `\nKey Points:\n${llmContext.keyPoints.map(point => `- ${point}`).join('\n')}\n`;
        }

        // Relationships and implications
        if (llmContext.relationships) {
            prompt += `\nRelationships and Connections:\n${llmContext.relationships}\n`;
        }

        if (llmContext.storyImplications) {
            prompt += `\nStory Implications:\n${llmContext.storyImplications}\n`;
        }

        // Tone and atmosphere
        if (llmContext.tone) {
            prompt += `\nTone and Atmosphere:\n${llmContext.tone}\n`;
        }

        // Hidden information last, as it might influence the response more subtly
        if (llmContext.hiddenInformation) {
            prompt += `\nAdditional Context:\n${llmContext.hiddenInformation}\n`;
        }

        return prompt;
    }

    protected validateResponse(response: Record<string, any>): boolean {
        // First validate LLM context if present
        if (response.llmContext && !this.validateLLMContext(response.llmContext)) {
            return false;
        }

        // Then validate entity-specific fields
        return this.validateEntitySpecificFields(response);
    }

    protected formatPrompt(request: AIAssistRequest): string {
        const { prompt, currentData, quickAdjustments, additionalContext } = request;
        let formattedPrompt = '';

        // Add LLM context if available
        if (currentData?.llmContext) {
            formattedPrompt += this.formatLLMContextPrompt(currentData.llmContext);
        }

        // Add entity-specific formatting
        formattedPrompt += this.formatEntitySpecificPrompt(request);

        // Add quick adjustments and additional context
        if (quickAdjustments?.length) {
            formattedPrompt += `\nRequested Adjustments:\n`;
            formattedPrompt += quickAdjustments.join('\n');
        }

        if (additionalContext) {
            formattedPrompt += `\nAdditional Context:\n${JSON.stringify(additionalContext)}\n`;
        }

        return formattedPrompt;
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
        console.log(this.formatPrompt(request));

        // Get language from current data if it exists
        const language = (request.currentData as any)?.language;
        const systemPrompt = `You are a helpful AI that identifies which fields should be updated based on user prompts. Only select fields that are directly relevant to the user's request, except for those that are under LLM Context, those you can more liberally select. You MUST respond in ${language} language only.`
            ;

        const response = await this.openai.chat.completions.create({
            model: this.config.model,
            temperature: 0.2, // Lower temperature for more deterministic field selection
            max_tokens: this.config.maxTokens,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
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

        return JSON.parse(functionCall.arguments);
    }

    protected async generateFieldContent(
        request: AIAssistRequest,
        fieldsToUpdate: string[]
    ): Promise<Record<string, any>> {
        // Create a schema that only includes the fields we want to update
        const restrictedSchema = this.createRestrictedSchema(fieldsToUpdate);

        // Get language from current data if it exists
        const language = (request.currentData as any)?.language;
        const systemPrompt = language
            ? `You are a helpful AI that generates content for ${request.entityType} fields. Only generate content for the specified fields. You MUST respond in ${language} language only.`
            : `You are a helpful AI that generates content for ${request.entityType} fields. Only generate content for the specified fields.`;

        const response = await this.openai.chat.completions.create({
            model: this.config.model,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
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