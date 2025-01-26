import { z } from 'zod';
import { baseDocumentSchema, llmContextSchema, commonFieldsSchema, createFormSchema } from './base';

/**
 * Schema for plot point timeframe
 * @category Schemas
 */
const timeframeSchema = z.object({
    start: z.coerce.date()
        .describe('When this plot point begins'),
    end: z.coerce.date()
        .optional()
        .describe('When this plot point ends (if applicable)'),
    duration: z.string()
        .optional()
        .describe('Duration of the plot point')
}).describe('Time period for the plot point');

/**
 * Schema for plot point location
 * @category Schemas
 */
const plotPointLocationSchema = z.object({
    primary: z.string()
        .describe('Primary location ID where this plot point takes place'),
    mentioned: z.array(z.string())
        .default([])
        .describe('Referenced location IDs in this plot point')
}).describe('Location information for the plot point');

/**
 * Schema for character involvement in plot points
 * @category Schemas
 */
const plotPointCharacterSchema = z.object({
    characterId: z.string()
        .describe('Reference to the character'),
    role: z.enum(['active', 'passive', 'mentioned'])
        .describe('Character\'s role in the plot point'),
    actions: z.array(z.string())
        .optional()
        .describe('Character\'s actions in this plot point')
}).describe('Character involvement in a plot point');

/**
 * Schema for items involved in plot points
 * @category Schemas
 */
const plotPointItemSchema = z.object({
    itemId: z.string()
        .describe('Reference to the item'),
    role: z.string()
        .describe('Item\'s role in the plot point'),
    significance: z.string()
        .optional()
        .describe('Item\'s significance in this plot point')
}).describe('Item involvement in a plot point');

/**
 * Schema for individual plot points
 * @category Schemas
 */
const plotPointSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .describe('Title of the plot point'),
    description: z.string()
        .min(1, 'Description is required')
        .describe('Description of what happens in this plot point'),
    llmContext: llmContextSchema
        .describe('AI/LLM processing context'),
    order: z.number()
        .min(0)
        .describe('Order of this plot point in the sequence'),
    timestamp: z.coerce.date()
        .describe('When this plot point occurs'),
    duration: z.string()
        .optional()
        .describe('Duration of this plot point'),
    detailLevel: z.enum(['major', 'minor'])
        .describe('Whether this is a major or minor plot point'),
    location: plotPointLocationSchema
        .describe('Location information'),
    characters: z.array(plotPointCharacterSchema)
        .default([])
        .describe('Characters involved in this plot point'),
    items: z.array(plotPointItemSchema)
        .default([])
        .describe('Items involved in this plot point'),
    mood: z.string()
        .optional()
        .describe('Emotional tone of the plot point'),
    weather: z.string()
        .optional()
        .describe('Weather conditions if relevant'),
    previousPlotPoints: z.array(z.string())
        .optional()
        .describe('References to plot points that precede this one'),
    nextPlotPoints: z.array(z.string())
        .optional()
        .describe('References to plot points that follow this one')
}).describe('Individual plot point details');

/**
 * Plot-specific fields schema
 * @category Schemas
 */
const plotFieldsSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .describe('Title of the plot'),
    summary: z.string()
        .min(1, 'Summary is required')
        .describe('Summary of the plot'),
    timeframe: timeframeSchema
        .describe('Time period of the plot'),
    plotPoints: z.array(plotPointSchema)
        .default([])
        .describe('Sequence of plot points that make up this plot'),
    status: z.enum(['draft', 'in-progress', 'completed'])
        .default('draft')
        .describe('Current status of the plot'),
    mainCharacters: z.array(z.string())
        .default([])
        .describe('IDs of main characters in this plot'),
    tags: z.array(z.string())
        .default([])
        .describe('Tags for categorizing and finding this plot'),
    llmContext: llmContextSchema
        .extend({
            shortDescription: z.string()
                .default('')
                .describe('Brief AI-friendly description of the plot')
        })
        .default({
            shortDescription: ''
        })
        .describe('Metadata and context for AI/LLM processing')
}).describe('Plot-specific fields and their validation rules');

/**
 * Complete plot schema for server-side operations
 * @category Schemas
 */
export const plotSchema = baseDocumentSchema
    .merge(commonFieldsSchema)
    .merge(plotFieldsSchema)
    .extend({
        universeId: z.string()
            .describe('Reference to parent universe')
    })
    .describe('Complete plot schema with all fields and validation rules');

/**
 * Form-specific schema for client-side operations
 * @category Schemas
 */
export const plotFormSchema = createFormSchema(plotFieldsSchema)
    .describe('Client-side form validation schema for plots');

// Export types derived from schemas
export type Plot = z.infer<typeof plotSchema>;
export type PlotForm = z.infer<typeof plotFormSchema>;
export type PlotPoint = z.infer<typeof plotPointSchema>;
export type PlotPointCharacter = z.infer<typeof plotPointCharacterSchema>;
export type PlotPointItem = z.infer<typeof plotPointItemSchema>;
export type PlotPointLocation = z.infer<typeof plotPointLocationSchema>;
export type Timeframe = z.infer<typeof timeframeSchema>; 