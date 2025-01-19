import type { ObjectId } from 'mongodb';

export interface BaseDocument {
    _id?: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    version: number;    // Basic versioning support
    lastModifiedBy: string;  // Supabase user ID of last editor
}

export interface User extends BaseDocument {
    supabaseId: string;
    email: string;
    // Add other user fields as needed
}

export interface LLMContext {
    shortDescription: string;      // Quick essence for simple queries
    longDescription?: string;      // Detailed context for deep dives
    keyPoints?: string[];         // Crucial bullet points
    relationships?: string;       // Connections to other elements
    hiddenInformation?: string;   // Non-obvious but important details
    storyImplications?: string;   // Story impact and potential
    tone?: string;               // Emotional/atmospheric notes
    systemNotes?: string;        // Special LLM instructions
}


export interface Universe extends BaseDocument {
    name: string;
    description: string;
    llmContext: LLMContext;
    creatorId: string;
    collaborators?: string[];
    tags?: string[];
    isPublic: boolean;
    coverImageUrl?: string;
    genre?: string[];
    targetAgeRange?: {
        min: number;
        max: number;
    };
    language?: string;
}

export interface Character extends BaseDocument {
    universeId: string;
    name: string;
    description: string;
    llmContext?: LLMContext;
    mainCharacter?: boolean;        // New field for identifying principal characters
    status?: 'alive' | 'deceased' | 'unknown';  // New status field
    tags?: string[];  // New tags field
    backstory?: string;
    traits?: string[];
    originLocation?: {            // New field for character origins
        locationId: string;
        description?: string;
        timeframe?: {
            start?: Date;
            end?: Date;
        };
    };
    relationships?: Array<{
        characterId: string;
        relationshipType: string;
        description: string;
        timeframe?: {
            start: Date;
            end?: Date;
        };
    }>;
    imageUrl?: string;
    age?: number;
    species?: string;
    abilities?: string[];
    lastKnownLocation?: {
        locationId: string;
        timestamp: Date;
    };
}

export interface Location extends BaseDocument {
    universeId: string;
    name: string;
    description: string;
    llmContext: LLMContext;
    type: string;
    status: 'exists' | 'destroyed' | 'changed';  // New status field
    tags?: string[];  // New tags field
    climate?: string;
    inhabitants?: Array<{
        characterId: string;
        timeframe: {
            start: Date;
            end?: Date;
        };
    }>;
    parentLocationId?: string;
    mapCoordinates?: {
        x: number;
        y: number;
        z?: number;
    };
    imageUrl?: string;
}

export interface Plot extends BaseDocument {
    universeId: string;
    title: string;
    summary: string;
    llmContext: LLMContext;
    tags?: string[];  // New tags field
    timeframe: {
        start: Date;
        end?: Date;
        duration?: string;
    };
    plotPoints: Array<{
        title: string;
        description: string;
        llmContext: LLMContext;
        order: number;
        timestamp: Date;
        duration?: string;
        detailLevel: 'major' | 'minor';  // Replaces separate Scene interface
        location: {
            primary: string;        // Primary location ID
            mentioned: string[];    // Referenced locations
        };
        characters: Array<{
            characterId: string;
            role: 'active' | 'passive' | 'mentioned';
            actions?: string[];
        }>;
        items: Array<{
            itemId: string;
            role: string;
            significance?: string;
        }>;
        mood?: string;             // Emotional tone of the plot point
        weather?: string;          // If relevant
        previousPlotPoints?: string[];
        nextPlotPoints?: string[];
    }>;
    status: 'draft' | 'in-progress' | 'completed';
    mainCharacters: string[];      // References to Character IDs
}

export interface Event extends BaseDocument {
    universeId: string;
    title: string;
    description: string;
    llmContext: LLMContext;
    tags?: string[];  // New tags field
    timeframe: {
        start: Date;
        end?: Date;
        duration?: string;
    };
    type: 'historical' | 'active' | 'future';
    significance: string;
    impactedElements: {
        characters: Array<{
            characterId: string;
            impact: string;
        }>;
        locations: Array<{
            locationId: string;
            impact: string;
        }>;
        plots: string[];
    };
    causes?: string[];
    effects?: string[];
}

export interface WorldRule extends BaseDocument {
    universeId: string;
    name: string;
    description: string;
    llmContext: LLMContext;
    tags?: string[];  // New tags field
    type: 'physical' | 'magical' | 'social' | 'technological';
    scope: 'universal' | 'regional' | 'temporal';
    constraints?: Array<{
        description: string;
        exceptions?: string;
    }>;
    relatedRules?: string[];
    affectedElements: {
        locations?: string[];
        timeframe?: {
            start?: Date;
            end?: Date;
        };
    };
}

export interface StoryArc extends BaseDocument {
    universeId: string;
    title: string;
    description: string;
    llmContext: LLMContext;
    tags?: string[];  // New tags field
    timeframe: {
        start: Date;
        end?: Date;
    };
    plots: Array<{
        plotId: string;
        order: number;
        significance: string;
    }>;
    mainCharacters: Array<{
        characterId: string;
        arc: string;
    }>;
    themes: string[];
    status: 'planned' | 'in-progress' | 'completed';
}

// Template placeholder for future implementation
export interface Template extends BaseDocument {
    universeId: string;
    type: 'character' | 'location' | 'plot';
    name: string;
    schema: Record<string, any>;
}

// Media Asset placeholder for future implementation
export interface MediaAsset extends BaseDocument {
    universeId: string;
    type: string;
    url: string;
    metadata: Record<string, any>;
}