import { z } from 'zod';
import type { ObjectId } from 'mongodb';

// Custom Zod refinement for ObjectId
const objectIdSchema = z.custom<ObjectId>((val) => {
    return val instanceof ObjectId || (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val));
}, 'Invalid ObjectId');

// Base document schema that all entities extend
export const baseDocumentSchema = z.object({
    _id: objectIdSchema.optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    version: z.number(),
    lastModifiedBy: z.string()
});

// LLM Context schema used across entities
export const llmContextSchema = z.object({
    shortDescription: z.string().min(1, 'Short description is required'),
    longDescription: z.string().optional(),
    keyPoints: z.array(z.string()).optional(),
    relationships: z.string().optional(),
    hiddenInformation: z.string().optional(),
    storyImplications: z.string().optional(),
    tone: z.string().optional(),
    systemNotes: z.string().optional()
});

// Helper function to create form schemas from entity schemas
export function createFormSchema<T extends z.ZodType>(
    entitySchema: T,
    requiredFields: (keyof z.infer<T>)[]
) {
    return entitySchema.extend({
        // Add any common form-specific fields here
    }).refine(
        (data) => {
            return requiredFields.every(field => data[field] !== undefined && data[field] !== '');
        },
        {
            message: `Required fields: ${requiredFields.join(', ')}`,
            path: requiredFields
        }
    );
}

// Reusable field schemas
export const commonFields = {
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().default(false)
} as const;

// Type utilities
export type InferSchemaType<T extends z.ZodType> = z.infer<T>; 