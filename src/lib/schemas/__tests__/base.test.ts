import { describe, it, expect } from 'vitest';
import { ObjectId } from 'mongodb';
import {
    objectIdSchema,
    llmContextSchema,
    fieldSelectionSchema,
    baseDocumentSchema,
    baseFormSchema,
    commonFieldsSchema,
    createFormSchema
} from '../base';
import { z } from 'zod';

describe('Base Schemas', () => {
    describe('objectIdSchema', () => {
        it('should validate valid ObjectId strings', () => {
            const validId = '507f1f77bcf86cd799439011';
            expect(() => objectIdSchema.parse(validId)).not.toThrow();
        });

        it('should validate MongoDB ObjectId instances', () => {
            const validId = new ObjectId();
            expect(() => objectIdSchema.parse(validId)).not.toThrow();
        });

        it('should reject invalid ObjectId strings', () => {
            const invalidId = 'invalid123';
            expect(() => objectIdSchema.parse(invalidId)).toThrow();
        });
    });

    describe('llmContextSchema', () => {
        it('should validate with required fields only', () => {
            const minimalContext = {
                shortDescription: 'A brief description'
            };
            expect(() => llmContextSchema.parse(minimalContext)).not.toThrow();
        });

        it('should validate with all fields', () => {
            const fullContext = {
                shortDescription: 'A brief description',
                longDescription: 'A longer description',
                keyPoints: ['Point 1', 'Point 2'],
                relationships: 'Related to X and Y',
                hiddenInformation: 'Secret info',
                storyImplications: 'Affects the plot',
                tone: 'Serious',
                systemNotes: 'Technical details'
            };
            expect(() => llmContextSchema.parse(fullContext)).not.toThrow();
        });

        it('should reject missing required fields', () => {
            const invalidContext = {};
            expect(() => llmContextSchema.parse(invalidContext)).toThrow();
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
            };
            expect(() => fieldSelectionSchema.parse(invalidSelection)).toThrow();
        });
    });

    describe('baseDocumentSchema', () => {
        it('should validate minimal document', () => {
            const minimalDoc = {};
            expect(() => baseDocumentSchema.parse(minimalDoc)).not.toThrow();
        });

        it('should validate complete document', () => {
            const fullDoc = {
                _id: '507f1f77bcf86cd799439011',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                lastModifiedBy: 'user123',
                creatorId: 'user123'
            };
            expect(() => baseDocumentSchema.parse(fullDoc)).not.toThrow();
        });
    });

    describe('commonFieldsSchema', () => {
        it('should validate with required fields', () => {
            const validFields = {
                name: 'Test Entity',
                description: 'Test Description',
                isPublic: false,
                llmContext: {
                    shortDescription: 'Brief description'
                }
            };
            expect(() => commonFieldsSchema.parse(validFields)).not.toThrow();
        });

        it('should use default values', () => {
            const minimalFields = {
                name: 'Test Entity',
                description: 'Test Description'
            };
            const result = commonFieldsSchema.parse(minimalFields);
            expect(result.isPublic).toBe(false);
            expect(result.llmContext).toEqual({ shortDescription: '' });
        });

        it('should reject missing required fields', () => {
            const invalidFields = {
                name: 'Test Entity'
            };
            expect(() => commonFieldsSchema.parse(invalidFields)).toThrow();
        });
    });

    describe('createFormSchema', () => {
        it('should create form schema without server fields', () => {
            // Create a test schema with both client and server fields
            const testSchema = z.object({
                _id: z.string(),
                name: z.string(),
                description: z.string(),
                createdAt: z.string(),
                version: z.number()
            });

            const formSchema = createFormSchema(testSchema);

            // Test that server fields are removed
            const shape = formSchema.shape;
            expect(shape).toHaveProperty('name');
            expect(shape).toHaveProperty('description');
            expect(shape).not.toHaveProperty('_id');
            expect(shape).not.toHaveProperty('createdAt');
            expect(shape).not.toHaveProperty('version');
        });

        it('should validate form data correctly', () => {
            const testSchema = z.object({
                _id: z.string(),
                name: z.string(),
                description: z.string(),
                createdAt: z.string()
            });

            const formSchema = createFormSchema(testSchema);

            const validData = {
                name: 'Test',
                description: 'Description'
            };

            const invalidData = {
                name: 'Test',
                description: 'Description',
                _id: '123' // Should be stripped out
            };

            expect(() => formSchema.parse(validData)).not.toThrow();
            expect(() => formSchema.parse(invalidData)).not.toThrow();
            const result = formSchema.parse(invalidData);
            expect(result).not.toHaveProperty('_id');
        });
    });
}); 