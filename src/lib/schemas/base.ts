import { z } from 'zod';

/** 
 * ObjectId schema that works in both client and server contexts
 * Validates both string format and MongoDB ObjectId instances
 */
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format').or(z.any().refine(
    (val) => typeof val === 'object' && val?.toString?.().match(/^[0-9a-fA-F]{24}$/),
    'Invalid ObjectId'
));

/** 
 * Server-side document schema with metadata fields
 * @property _id - MongoDB document ID
 * @property createdAt - Document creation timestamp
 * @property updatedAt - Last modification timestamp
 * @property version - Document version for optimistic concurrency
 * @property lastModifiedBy - Supabase ID of last editor
 * @property creatorId - Supabase ID of document creator
 */
export const baseDocumentSchema = z.object({
    _id: z.any().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    version: z.number(),
    lastModifiedBy: z.string(),
    creatorId: z.string()
});

/** 
 * Base form schema for client-side operations
 * Minimal version of baseDocumentSchema for form handling
 */
export const baseFormSchema = z.object({
    _id: z.any().optional()
});

/** 
 * LLM Context schema for AI-related metadata
 * Used across all entities to store AI/LLM-specific information
 * @property shortDescription - Brief entity description for simple queries
 * @property longDescription - Detailed context for deep dives
 * @property keyPoints - Important bullet points about the entity
 * @property relationships - Connections to other elements
 * @property hiddenInformation - Non-obvious but important details
 * @property storyImplications - Impact on the story
 * @property tone - Emotional/atmospheric notes
 * @property systemNotes - Special instructions for LLM
 */
export const llmContextSchema = z.object({
    shortDescription: z.string().optional(),
    longDescription: z.string().optional(),
    keyPoints: z.array(z.string()).optional(),
    relationships: z.string().optional(),
    hiddenInformation: z.string().optional(),
    storyImplications: z.string().optional(),
    tone: z.string().optional(),
    systemNotes: z.string().optional()
});

/** 
 * Common fields shared across most entities
 * @property name - Display name of the entity
 * @property description - Detailed entity description
 * @property isPublic - Whether the entity is publicly visible
 * @property llmContext - AI/LLM-related metadata
 */
export const commonFieldsSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    isPublic: z.boolean(),
    llmContext: llmContextSchema
});

/** 
 * Helper to create form schemas with common fields
 * Combines baseFormSchema and commonFieldsSchema with entity-specific schema
 * @param schema - Entity-specific Zod schema to merge with base schemas
 */
export function createFormSchema<T extends z.AnyZodObject>(schema: T) {
    return baseFormSchema.merge(commonFieldsSchema).merge(schema);
}

// Export types derived from schemas
export type BaseDocument = z.infer<typeof baseDocumentSchema>;
export type LLMContext = z.infer<typeof llmContextSchema>;
export type CommonFields = z.infer<typeof commonFieldsSchema>; 