import { z } from 'zod';

// Base LLM Context Schema
export const llmContextSchema = z.object({
    shortDescription: z.string(),
    longDescription: z.string().optional(),
    keyPoints: z.array(z.string()).optional(),
    relationships: z.string().optional(),
    hiddenInformation: z.string().optional(),
    storyImplications: z.string().optional(),
    tone: z.string().optional(),
    systemNotes: z.string().optional()
});

// Field Selection Schema
export const fieldSelectionSchema = z.object({
    fieldsToUpdate: z.array(z.string()),
    reasoning: z.string()
});

// Base Entity Schema (to be extended by specific entities)
export const baseEntitySchema = z.object({
    _id: z.string().optional(),
    createdAt: z.string().optional(), // Will be converted to Date
    updatedAt: z.string().optional(), // Will be converted to Date
    version: z.number().optional(),
    lastModifiedBy: z.string().optional(),
});

export type LLMContext = z.infer<typeof llmContextSchema>;
export type FieldSelection = z.infer<typeof fieldSelectionSchema>;