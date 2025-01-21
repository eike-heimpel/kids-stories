import { describe, it, expect } from 'vitest';
import { llmContextSchema, fieldSelectionSchema, baseEntitySchema } from '../base';
import type { LLMContext, FieldSelection } from '../base';

describe('AI Base Schemas', () => {
    describe('llmContextSchema', () => {
        it('should validate minimal LLM context', () => {
            const minimalContext = {
                shortDescription: 'A brief description'
            };
            expect(() => llmContextSchema.parse(minimalContext)).not.toThrow();
        });

        it('should validate complete LLM context', () => {
            const completeContext = {
                shortDescription: 'A brief description',
                longDescription: 'A detailed description',
                keyPoints: ['Point 1', 'Point 2'],
                relationships: 'Related to X and Y',
                hiddenInformation: 'Secret info',
                storyImplications: 'Affects the plot',
                tone: 'Serious',
                systemNotes: 'Technical details'
            };
            expect(() => llmContextSchema.parse(completeContext)).not.toThrow();
        });

        it('should reject missing required fields', () => {
            const invalidContext = {};
            expect(() => llmContextSchema.parse(invalidContext)).toThrow();
        });

        it('should validate array fields', () => {
            const context: Partial<LLMContext> & { shortDescription: string } = {
                shortDescription: 'A brief description',
                keyPoints: 'not an array' as any // Invalid type
            };
            expect(() => llmContextSchema.parse(context)).toThrow();

            context.keyPoints = ['Valid point'];
            expect(() => llmContextSchema.parse(context)).not.toThrow();
        });
    });

    describe('fieldSelectionSchema', () => {
        it('should validate valid field selection', () => {
            const validSelection = {
                fieldsToUpdate: ['name', 'description'],
                reasoning: 'Updating basic info'
            };
            expect(() => fieldSelectionSchema.parse(validSelection)).not.toThrow();
        });

        it('should reject missing fields', () => {
            const invalidSelection = {
                fieldsToUpdate: ['name']
                // Missing reasoning
            };
            expect(() => fieldSelectionSchema.parse(invalidSelection)).toThrow();

            const invalidSelection2 = {
                reasoning: 'Updating fields'
                // Missing fieldsToUpdate
            };
            expect(() => fieldSelectionSchema.parse(invalidSelection2)).toThrow();
        });

        it('should validate array fields', () => {
            const selection: Partial<FieldSelection> & { reasoning: string } = {
                fieldsToUpdate: 'not an array' as any, // Invalid type
                reasoning: 'Updating fields'
            };
            expect(() => fieldSelectionSchema.parse(selection)).toThrow();

            selection.fieldsToUpdate = ['valid field'];
            expect(() => fieldSelectionSchema.parse(selection)).not.toThrow();
        });
    });

    describe('baseEntitySchema', () => {
        it('should validate minimal entity', () => {
            const minimalEntity = {};
            expect(() => baseEntitySchema.parse(minimalEntity)).not.toThrow();
        });

        it('should validate complete entity', () => {
            const completeEntity = {
                _id: '507f1f77bcf86cd799439011',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                lastModifiedBy: 'user123'
            };
            expect(() => baseEntitySchema.parse(completeEntity)).not.toThrow();
        });

        it('should validate field types', () => {
            const invalidEntity = {
                _id: 123, // Should be string
                version: '1', // Should be number
                lastModifiedBy: 123 // Should be string
            };
            expect(() => baseEntitySchema.parse(invalidEntity)).toThrow();

            const validEntity = {
                _id: '123',
                version: 1,
                lastModifiedBy: 'user123'
            };
            expect(() => baseEntitySchema.parse(validEntity)).not.toThrow();
        });
    });
}); 