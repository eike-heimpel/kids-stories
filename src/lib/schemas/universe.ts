import { z } from 'zod';
import { baseDocumentSchema, llmContextSchema, commonFieldsSchema, createFormSchema } from './base';

/**
 * Schema for target age range of the universe
 * @category Schemas
 * @remarks
 * Defines the intended age range for the universe's content.
 * Ensures minimum age is not greater than maximum age.
 */
const targetAgeRangeSchema = z.object({
    /** Minimum target age for the universe content */
    min: z.number()
        .min(0, 'Minimum age must be 0 or greater')
        .describe('Minimum target age for the universe content'),

    /** Maximum target age for the universe content */
    max: z.number()
        .min(0, 'Maximum age must be 0 or greater')
        .describe('Maximum target age for the universe content')
}).refine(data => data.max >= data.min, {
    message: 'Maximum age must be greater than or equal to minimum age',
    path: ['max']
}).describe('Age range this universe is intended for');

/**
 * Universe-specific fields schema
 * @category Schemas
 * @remarks
 * Defines the unique attributes and properties of a universe.
 * Each field has validation rules and descriptions for documentation.
 */
const universeFieldsSchema = z.object({
    /** Primary language used in the universe content */
    language: z.string()
        .min(1, 'Language is required')
        .describe('Primary language used in the universe content'),

    /** List of user IDs who have permission to edit this universe */
    collaborators: z.array(z.string())
        .default([])
        .describe('List of user IDs who have permission to edit this universe'),

    /** URL pointing to the cover image for this universe */
    coverImageUrl: z.string()
        .url('Invalid URL')
        .optional()
        .describe('URL pointing to the cover image for this universe'),

    /** List of literary genres this universe belongs to */
    genre: z.array(z.string())
        .default([])
        .describe('List of literary genres this universe belongs to'),

    /** Keywords and categories for organizing and finding this universe */
    tags: z.array(z.string())
        .default([])
        .describe('Keywords and categories for organizing and finding this universe'),

    /** Recommended age range for readers/users of this universe */
    targetAgeRange: targetAgeRangeSchema
        .optional()
        .default({ min: 0, max: 0 })
        .describe('Recommended age range for readers/users of this universe'),

    /** Metadata and context for AI/LLM processing */
    llmContext: llmContextSchema
        .extend({
            /** Brief AI-friendly description of the universe */
            shortDescription: z.string()
                .default('')
                .describe('Brief AI-friendly description of the universe')
        })
        .default({
            shortDescription: ''
        })
        .describe('Metadata and context for AI/LLM processing')
}).describe('Universe-specific fields and their validation rules');

/**
 * Complete universe schema for server-side operations
 * @category Schemas
 * @remarks
 * Combines base document fields, common fields, and universe-specific fields.
 * Used for database operations and full validation.
 * 
 * Includes:
 * - All base document fields (_id, timestamps, version, etc.)
 * - All common fields (name, description, isPublic, llmContext)
 * - All universe-specific fields
 * 
 * @see {@link Universe} type
 * @see {@link universeFormSchema} for client-side form validation
 */
export const universeSchema = baseDocumentSchema
    .merge(commonFieldsSchema)
    .merge(universeFieldsSchema)
    .describe('Complete universe schema with all fields and validation rules');

/**
 * Form-specific schema for client-side operations
 * @category Schemas
 * @remarks
 * Used for form validation on the client side.
 * Excludes server-managed fields like _id, timestamps, etc.
 * 
 * @see {@link UniverseForm} type
 * @see {@link universeSchema} for full server-side schema
 */
export const universeFormSchema = createFormSchema(universeFieldsSchema)
    .describe('Client-side form validation schema for universes');

// Export types derived from schemas
export type Universe = z.infer<typeof universeSchema>;
export type UniverseForm = z.infer<typeof universeFormSchema>; 