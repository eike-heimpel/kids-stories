import { z } from 'zod';

/**
 * ObjectId schema that works in both client and server contexts
 * Validates both string format and MongoDB ObjectId instances
 */
export const objectIdSchema = z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
    .describe('MongoDB ObjectId in string format')
    .or(z.any().refine(
        (val) => typeof val === 'object' && val?.toString?.().match(/^[0-9a-fA-F]{24}$/),
        'Invalid ObjectId'
    ).describe('MongoDB ObjectId instance'));

/**
 * Schema for LLM (Language Learning Model) context
 * @category Schemas
 * @remarks
 * Defines metadata and context information used by AI/LLM systems.
 * This schema is used across different entity types to provide
 * consistent AI-friendly descriptions and context.
 */
export const llmContextSchema = z.object({
    /** Brief AI-friendly summary */
    shortDescription: z.string()
        .describe('Brief AI-friendly summary of the entity'),

    /** Detailed AI-friendly description */
    longDescription: z.string()
        .optional()
        .describe('Detailed AI-friendly description of the entity'),

    /** Important points for AI processing */
    keyPoints: z.array(z.string())
        .optional()
        .describe('Key points and important aspects for AI processing'),

    /** Entity relationships and connections */
    relationships: z.string()
        .optional()
        .describe('Description of relationships and connections to other entities'),

    /** Information not publicly visible */
    hiddenInformation: z.string()
        .optional()
        .describe('Private or hidden information not shown publicly'),

    /** Story and plot implications */
    storyImplications: z.string()
        .optional()
        .describe('Impact and implications on the story or plot'),

    /** Writing style and emotional tone */
    tone: z.string()
        .optional()
        .describe('Writing style and emotional tone to maintain'),

    /** System-level notes */
    systemNotes: z.string()
        .optional()
        .describe('Technical notes and system-level information')
}).describe('AI/LLM context and metadata');

/**
 * Schema for field selection during updates
 * @category Schemas
 * @remarks
 * Used when updating specific fields of an entity.
 * Requires both the fields to update and reasoning for the changes.
 */
export const fieldSelectionSchema = z.object({
    /** List of fields to be updated */
    fieldsToUpdate: z.array(z.string())
        .describe('Array of field names to be updated'),

    /** Reason for the update */
    reasoning: z.string()
        .describe('Explanation for why these fields are being updated')
}).describe('Field selection for partial updates');

/**
 * Base document schema with common MongoDB fields
 * @category Schemas
 * @remarks
 * Core fields required for all database documents.
 * Includes timestamps, versioning, and user tracking.
 */
export const baseDocumentSchema = z.object({
    /** MongoDB document ID */
    _id: z.string()
        .optional()
        .describe('Unique MongoDB document identifier'),

    /** Document creation timestamp */
    createdAt: z.string()
        .optional()
        .describe('When this document was first created'),

    /** Document last update timestamp */
    updatedAt: z.string()
        .optional()
        .describe('When this document was last modified'),

    /** Document version number */
    version: z.number()
        .optional()
        .describe('Document version for optimistic concurrency'),

    /** ID of user who last modified */
    lastModifiedBy: z.string()
        .optional()
        .describe('User ID of who last modified this document'),

    /** ID of user who created */
    creatorId: z.string()
        .optional()
        .describe('User ID of who created this document')
}).describe('Base document fields for MongoDB documents');

/**
 * Base form schema for client-side operations
 * Minimal version of baseDocumentSchema for form handling
 */
export const baseFormSchema = z.object({
    _id: z.any()
        .optional()
        .describe('MongoDB document ID (optional for new documents)')
});

/**
 * Common fields shared across entity types
 * @category Schemas
 * @remarks
 * Fields that are common to all main entity types
 * (universes, characters, locations, etc.)
 */
export const commonFieldsSchema = z.object({
    /** Entity name */
    name: z.string()
        .min(1, 'Name is required')
        .describe('Name of the entity'),

    /** Entity description */
    description: z.string()
        .min(1, 'Description is required')
        .describe('Description of the entity'),

    /** Public visibility flag */
    isPublic: z.boolean()
        .default(false)
        .describe('Whether this entity is publicly visible'),

    /** AI/LLM context data */
    llmContext: llmContextSchema
        .partial()
        .default(() => ({
            shortDescription: ''
        }))
        .describe('AI/LLM context and metadata')
}).describe('Common fields shared across entities');

/**
 * Creates a form schema from an entity schema
 * @category Schema Utilities
 * @remarks
 * Utility function to create a client-side form schema
 * by excluding server-managed fields from a base schema.
 */
export const createFormSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => {
    return schema.omit({
        _id: true,
        createdAt: true,
        updatedAt: true,
        version: true,
        lastModifiedBy: true,
        creatorId: true
    } as any).describe('Client-side form validation schema');
};

// Export types derived from schemas
export type LLMContext = z.infer<typeof llmContextSchema>;
export type FieldSelection = z.infer<typeof fieldSelectionSchema>;
export type BaseDocument = z.infer<typeof baseDocumentSchema>;
export type CommonFields = z.infer<typeof commonFieldsSchema>; 