import { describe, it, expect } from 'vitest';
import { universeSchema, universeFormSchema } from '../universe';
import type { Universe } from '../universe';

describe('Universe Schemas', () => {
    describe('universeSchema', () => {
        it('should validate a minimal universe', () => {
            const minimalUniverse = {
                name: 'Test Universe',
                description: 'A test universe',
                language: 'English'
            };
            const result = universeSchema.parse(minimalUniverse);
            expect(result).toMatchObject({
                ...minimalUniverse,
                collaborators: [],
                genre: [],
                tags: [],
                targetAgeRange: { min: 0, max: 0 },
                llmContext: { shortDescription: '' }
            });
        });

        it('should validate a complete universe', () => {
            const now = new Date();
            const completeUniverse = {
                name: 'Test Universe',
                description: 'A test universe',
                _id: '507f1f77bcf86cd799439011',
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
                version: 1,
                lastModifiedBy: 'user123',
                creatorId: 'user123',
                isPublic: true,
                language: 'English',
                collaborators: ['user456', 'user789'],
                coverImageUrl: 'https://example.com/image.jpg',
                genre: ['Fantasy', 'Adventure'],
                tags: ['magic', 'dragons'],
                targetAgeRange: {
                    min: 8,
                    max: 12
                },
                llmContext: {
                    shortDescription: 'A magical universe',
                    longDescription: 'A detailed description',
                    keyPoints: ['Important point'],
                    relationships: 'Connected universes',
                    hiddenInformation: 'Secret info',
                    storyImplications: 'Major plot points',
                    tone: 'Light-hearted',
                    systemNotes: 'Technical details'
                }
            };
            expect(() => universeSchema.parse(completeUniverse)).not.toThrow();
        });

        it('should validate target age range constraints', () => {
            const universe = {
                name: 'Test Universe',
                description: 'A test universe',
                language: 'English',
                targetAgeRange: {
                    min: 10,
                    max: 5 // Invalid: max < min
                }
            };
            expect(() => universeSchema.parse(universe)).toThrow();

            universe.targetAgeRange = {
                min: -1, // Invalid: negative age
                max: 5
            };
            expect(() => universeSchema.parse(universe)).toThrow();

            universe.targetAgeRange = {
                min: 5,
                max: 10 // Valid: max > min
            };
            expect(() => universeSchema.parse(universe)).not.toThrow();
        });

        it('should validate cover image URL format', () => {
            const universe = {
                name: 'Test Universe',
                description: 'A test universe',
                language: 'English',
                coverImageUrl: 'not-a-url'
            };
            expect(() => universeSchema.parse(universe)).toThrow();

            universe.coverImageUrl = 'https://example.com/image.jpg';
            expect(() => universeSchema.parse(universe)).not.toThrow();
        });

        it('should require language field', () => {
            const universe: Partial<Universe> = {
                name: 'Test Universe',
                description: 'A test universe'
            };
            expect(() => universeSchema.parse(universe)).toThrow();

            universe.language = '';
            expect(() => universeSchema.parse(universe)).toThrow();

            universe.language = 'English';
            expect(() => universeSchema.parse(universe)).not.toThrow();
        });
    });

    describe('universeFormSchema', () => {
        it('should exclude server-managed fields', () => {
            const formData = {
                name: 'Test Universe',
                description: 'A test universe',
                language: 'English',
                _id: '507f1f77bcf86cd799439011', // Should be stripped
                createdAt: new Date().toISOString(), // Should be stripped
                genre: ['Fantasy'],
                tags: ['magic']
            };

            const result = universeFormSchema.parse(formData);
            expect(result).not.toHaveProperty('_id');
            expect(result).not.toHaveProperty('createdAt');
            expect(result).toHaveProperty('language');
            expect(result).toHaveProperty('genre');
            expect(result).toHaveProperty('tags');
        });

        it('should validate form-specific constraints', () => {
            const formData = {
                language: '', // Invalid: empty string
                targetAgeRange: {
                    min: 10,
                    max: 5 // Invalid: max < min
                }
            };

            expect(() => universeFormSchema.parse(formData)).toThrow();

            formData.language = 'English';
            formData.targetAgeRange = {
                min: 5,
                max: 10
            };
            expect(() => universeFormSchema.parse(formData)).not.toThrow();
        });

        it('should handle arrays with defaults', () => {
            const formData = {
                language: 'English'
            };

            const result = universeFormSchema.parse(formData) as Record<string, unknown>;
            expect(result.collaborators).toEqual([]);
            expect(result.genre).toEqual([]);
            expect(result.tags).toEqual([]);
        });
    });
}); 