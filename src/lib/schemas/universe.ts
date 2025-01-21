import { z } from 'zod';
import { baseDocumentSchema, llmContextSchema, commonFieldsSchema, createFormSchema } from './base';

// Schema for target age range
const targetAgeRangeSchema = z.object({
    min: z.number().min(0, 'Minimum age must be 0 or greater'),
    max: z.number().min(0, 'Maximum age must be 0 or greater')
}).refine(data => data.max >= data.min, {
    message: 'Maximum age must be greater than or equal to minimum age',
    path: ['max']
});

// Universe-specific fields (client-side)
const universeFieldsSchema = z.object({
    language: z.string().min(1, 'Language is required'),
    collaborators: z.array(z.string()).default([]),
    coverImageUrl: z.string().url('Invalid URL').optional(),
    genre: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    targetAgeRange: targetAgeRangeSchema.optional().default({ min: 0, max: 0 }),
    llmContext: llmContextSchema.extend({
        shortDescription: z.string().default('')
    }).default({
        shortDescription: ''
    })
});

// Full universe schema (server-side)
export const universeSchema = baseDocumentSchema
    .merge(commonFieldsSchema)
    .merge(universeFieldsSchema);

// Form-specific schema (client-side)
export const universeFormSchema = createFormSchema(universeFieldsSchema);

// Export types derived from schemas
export type Universe = z.infer<typeof universeSchema>;
export type UniverseForm = z.infer<typeof universeFormSchema>; 