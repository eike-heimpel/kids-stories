import { z } from 'zod';
import { baseDocumentSchema, llmContextSchema, commonFieldsSchema, createFormSchema } from './base';

/**
 * Schema for character's origin location
 * @category Schemas
 * @remarks
 * Represents where a character originated from, including optional timeframe.
 */
const originLocationSchema = z.object({
    /** Reference to the location */
    locationId: z.string()
        .describe('Reference to the location'),

    /** Optional description of character's connection to this location */
    description: z.string()
        .optional()
        .describe('Optional description of character\'s connection to this location'),

    /** Time period character was at this location */
    timeframe: z.object({
        /** When character arrived at this location */
        start: z.coerce.date()
            .optional()
            .describe('When character arrived at this location'),

        /** When character left this location */
        end: z.coerce.date()
            .optional()
            .describe('When character left this location')
    })
        .optional()
        .describe('Time period character was at this location')
}).describe('Character origin location details');

/**
 * Schema for character relationships
 * @category Schemas
 * @remarks
 * Defines relationships between characters.
 */
const relationshipSchema = z.object({
    /** Reference to related character */
    characterId: z.string()
        .describe('Reference to related character'),

    /** Type of relationship */
    relationshipType: z.string()
        .describe('Type of relationship (e.g., friend, enemy, mentor)'),

    /** Description of the relationship */
    description: z.string()
        .describe('Description of the relationship'),

    /** Time period of the relationship */
    timeframe: z.object({
        /** When relationship began */
        start: z.coerce.date()
            .describe('When relationship began'),

        /** When relationship ended */
        end: z.coerce.date()
            .optional()
            .describe('When relationship ended (if applicable)')
    }).describe('Time period of the relationship')
}).describe('Character relationship details');

/**
 * Schema for character's last known location
 * @category Schemas
 * @remarks
 * Tracks where a character was last seen.
 */
const lastKnownLocationSchema = z.object({
    /** Reference to the location */
    locationId: z.string()
        .describe('Reference to the location'),

    /** When character was last seen here */
    timestamp: z.coerce.date()
        .describe('When character was last seen here')
}).describe('Character last known location details');

/**
 * Character-specific fields schema
 * @category Schemas
 * @remarks
 * Defines the unique attributes and properties of a character.
 */
const characterFieldsSchema = z.object({
    /** Whether this is a main character */
    mainCharacter: z.boolean()
        .default(false)
        .describe('Whether this is a main character in the story'),

    /** Current status of the character */
    status: z.enum(['alive', 'deceased', 'unknown'])
        .default('alive')
        .describe('Current status of the character'),

    /** Character's background story */
    backstory: z.string()
        .optional()
        .describe('Character\'s background story'),

    /** Character personality traits */
    traits: z.array(z.string())
        .default([])
        .describe('Character personality traits'),

    /** Where the character originated from */
    originLocation: originLocationSchema
        .optional()
        .describe('Where the character originated from'),

    /** Character's relationships */
    relationships: z.array(relationshipSchema)
        .default([])
        .describe('Character\'s relationships with other characters'),

    /** URL to character's image */
    imageUrl: z.string()
        .url('Invalid URL')
        .optional()
        .describe('URL to character\'s image'),

    /** Character's age */
    age: z.number()
        .min(0, 'Age must be 0 or greater')
        .optional()
        .describe('Character\'s age'),

    /** Character's species or race */
    species: z.string()
        .optional()
        .describe('Character\'s species or race'),

    /** Character's special abilities */
    abilities: z.array(z.string())
        .default([])
        .describe('Character\'s special abilities or skills'),

    /** Character's last known location */
    lastKnownLocation: lastKnownLocationSchema
        .optional()
        .describe('Character\'s last known whereabouts'),

    /** AI/LLM context data */
    llmContext: llmContextSchema
        .extend({
            /** Brief AI-friendly description */
            shortDescription: z.string()
                .default('')
                .describe('Brief description for AI processing')
        })
        .default({
            shortDescription: ''
        })
        .describe('AI/LLM-specific metadata')
}).describe('Character-specific fields and validation rules');

/**
 * Complete character schema for server-side operations
 * @category Schemas
 * @remarks
 * Combines base document fields, common fields, and character-specific fields.
 * Used for database operations and full validation.
 * 
 * Includes:
 * - All base document fields (_id, timestamps, version, etc.)
 * - All common fields (name, description, isPublic, llmContext)
 * - All character-specific fields
 * - universeId: Reference to parent universe
 * 
 * @see {@link Character} type
 * @see {@link characterFormSchema} for client-side form validation
 */
export const characterSchema = baseDocumentSchema
    .merge(commonFieldsSchema)
    .merge(characterFieldsSchema)
    .extend({
        /** Reference to parent universe */
        universeId: z.string()
            .describe('Reference to parent universe')
    }).describe('Complete character schema with all fields and validation rules');

/**
 * Form-specific schema for client-side operations
 * @category Schemas
 * @remarks
 * Used for form validation on the client side.
 * Excludes server-managed fields like _id, timestamps, etc.
 * 
 * @see {@link CharacterForm} type
 * @see {@link characterSchema} for full server-side schema
 */
export const characterFormSchema = createFormSchema(characterFieldsSchema)
    .describe('Client-side form validation schema for characters');

// Export types derived from schemas
export type Character = z.infer<typeof characterSchema>;
export type CharacterForm = z.infer<typeof characterFormSchema>;

// Export sub-types that might be useful elsewhere
export type CharacterOriginLocation = z.infer<typeof originLocationSchema>;
export type CharacterRelationship = z.infer<typeof relationshipSchema>;
export type CharacterLastKnownLocation = z.infer<typeof lastKnownLocationSchema>; 