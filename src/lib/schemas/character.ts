import { z } from 'zod';
import { baseDocumentSchema, llmContextSchema, commonFieldsSchema, createFormSchema } from './base';

// Schema for character's origin location
const originLocationSchema = z.object({
    locationId: z.string(),
    description: z.string().optional(),
    timeframe: z.object({
        start: z.coerce.date().optional(),
        end: z.coerce.date().optional()
    }).optional()
});

// Schema for character relationships
const relationshipSchema = z.object({
    characterId: z.string(),
    relationshipType: z.string(),
    description: z.string(),
    timeframe: z.object({
        start: z.coerce.date(),
        end: z.coerce.date().optional()
    })
});

// Schema for last known location
const lastKnownLocationSchema = z.object({
    locationId: z.string(),
    timestamp: z.coerce.date()
});

// Character-specific fields (client-side)
const characterFieldsSchema = z.object({
    mainCharacter: z.boolean().default(false),
    status: z.enum(['alive', 'deceased', 'unknown']).default('alive'),
    backstory: z.string().optional(),
    traits: z.array(z.string()).default([]),
    originLocation: originLocationSchema.optional(),
    relationships: z.array(relationshipSchema).default([]),
    imageUrl: z.string().url('Invalid URL').optional(),
    age: z.number().min(0, 'Age must be 0 or greater').optional(),
    species: z.string().optional(),
    abilities: z.array(z.string()).default([]),
    lastKnownLocation: lastKnownLocationSchema.optional(),
    llmContext: llmContextSchema.extend({
        shortDescription: z.string().default('')
    }).default({
        shortDescription: ''
    })
});

// Full character schema (server-side)
export const characterSchema = baseDocumentSchema
    .merge(commonFieldsSchema)
    .merge(characterFieldsSchema)
    .extend({
        universeId: z.string()
    });

// Form-specific schema (client-side)
export const characterFormSchema = createFormSchema(characterFieldsSchema);

// Export types derived from schemas
export type Character = z.infer<typeof characterSchema>;
export type CharacterForm = z.infer<typeof characterFormSchema>;

// Export sub-types that might be useful elsewhere
export type CharacterOriginLocation = z.infer<typeof originLocationSchema>;
export type CharacterRelationship = z.infer<typeof relationshipSchema>;
export type CharacterLastKnownLocation = z.infer<typeof lastKnownLocationSchema>; 