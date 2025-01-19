import type { LLMContext } from '../mongodb/types';

export type EntityType = 'universe' | 'character' | 'plot' | 'location' | 'event';

export interface AIAssistRequest {
    entityType: EntityType;
    prompt: string;
    currentData?: Record<string, any>;
    quickAdjustments?: string[];
    additionalContext?: Record<string, any>;
}

export interface AIAssistResponse {
    fieldsToUpdate: string[];  // Definitive list of fields to update
    updatedFields: Record<string, any>;
    reasoning: string;
    suggestedFollowUp?: string[];
}

// Schema property that matches OpenAI's function parameter requirements
export interface SchemaProperty {
    type: string;
    description: string;
    items?: SchemaProperty;
    properties?: Record<string, SchemaProperty>;
    required?: string[];
    enum?: string[];
}

// Base interface for all entity schemas matching OpenAI's function parameters
export interface EntitySchema {
    type: 'object';
    description: string;
    required: string[];
    properties: Record<string, SchemaProperty>;
}

// Configuration for OpenAI function calling
export interface OpenAIFunctionSchema {
    name: string;
    description: string;
    parameters: EntitySchema;
}

export interface AIServiceConfig {
    apiKey: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
}

// Re-export LLMContext for convenience
export type { LLMContext };