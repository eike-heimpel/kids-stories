import { describe, it, expect } from 'vitest';
import { characterSchema, characterFormSchema } from '../character';

describe('Character Schemas', () => {
    describe('characterSchema', () => {
        it('should validate a minimal character', () => {
            const minimalCharacter = {
                name: 'Test Character',
                description: 'A test character',
                universeId: '507f1f77bcf86cd799439011'
            };
            const result = characterSchema.parse(minimalCharacter);
            expect(result).toMatchObject({
                ...minimalCharacter,
                mainCharacter: false,
                status: 'alive',
                traits: [],
                relationships: [],
                abilities: [],
                llmContext: { shortDescription: '' }
            });
        });

        it('should validate a complete character', () => {
            const now = new Date();
            const completeCharacter = {
                name: 'Test Character',
                description: 'A test character',
                universeId: '507f1f77bcf86cd799439011',
                _id: '507f1f77bcf86cd799439012',
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
                version: 1,
                lastModifiedBy: 'user123',
                creatorId: 'user123',
                isPublic: true,
                mainCharacter: true,
                status: 'alive',
                backstory: 'A long time ago...',
                traits: ['brave', 'smart'],
                originLocation: {
                    locationId: '507f1f77bcf86cd799439013',
                    description: 'Born here',
                    timeframe: {
                        start: new Date('2000-01-01'),
                        end: new Date('2020-01-01')
                    }
                },
                relationships: [{
                    characterId: '507f1f77bcf86cd799439014',
                    relationshipType: 'friend',
                    description: 'Best friends',
                    timeframe: {
                        start: new Date('2010-01-01')
                    }
                }],
                imageUrl: 'https://example.com/image.jpg',
                age: 25,
                species: 'Human',
                abilities: ['magic', 'flying'],
                lastKnownLocation: {
                    locationId: '507f1f77bcf86cd799439015',
                    timestamp: now
                },
                llmContext: {
                    shortDescription: 'A brave hero',
                    longDescription: 'A detailed description',
                    keyPoints: ['Important point'],
                    relationships: 'Has many friends',
                    hiddenInformation: 'Secret info',
                    storyImplications: 'Major plot point',
                    tone: 'Serious',
                    systemNotes: 'Technical details'
                }
            };
            expect(() => characterSchema.parse(completeCharacter)).not.toThrow();
        });

        it('should validate character status enum', () => {
            const character = {
                name: 'Test Character',
                description: 'A test character',
                universeId: '507f1f77bcf86cd799439011',
                status: 'invalid'
            };
            expect(() => characterSchema.parse(character)).toThrow();

            character.status = 'deceased';
            expect(() => characterSchema.parse(character)).not.toThrow();
        });

        it('should validate age constraints', () => {
            const character = {
                name: 'Test Character',
                description: 'A test character',
                universeId: '507f1f77bcf86cd799439011',
                age: -1
            };
            expect(() => characterSchema.parse(character)).toThrow();

            character.age = 0;
            expect(() => characterSchema.parse(character)).not.toThrow();
        });

        it('should validate image URL format', () => {
            const character = {
                name: 'Test Character',
                description: 'A test character',
                universeId: '507f1f77bcf86cd799439011',
                imageUrl: 'not-a-url'
            };
            expect(() => characterSchema.parse(character)).toThrow();

            character.imageUrl = 'https://example.com/image.jpg';
            expect(() => characterSchema.parse(character)).not.toThrow();
        });

        it('should validate relationship timeframes', () => {
            const character = {
                name: 'Test Character',
                description: 'A test character',
                universeId: '507f1f77bcf86cd799439011',
                relationships: [{
                    characterId: '507f1f77bcf86cd799439014',
                    relationshipType: 'friend',
                    description: 'Best friends',
                    timeframe: {
                        // Missing required start date
                        end: new Date()
                    }
                }]
            };
            expect(() => characterSchema.parse(character)).toThrow();

            character.relationships[0].timeframe.start = new Date();
            expect(() => characterSchema.parse(character)).not.toThrow();
        });
    });

    describe('characterFormSchema', () => {
        it('should exclude server-managed fields', () => {
            const formData = {
                name: 'Test Character',
                description: 'A test character',
                _id: '507f1f77bcf86cd799439011', // Should be stripped
                createdAt: new Date().toISOString(), // Should be stripped
                mainCharacter: true,
                status: 'alive',
                traits: ['brave']
            };

            const result = characterFormSchema.parse(formData);
            expect(result).not.toHaveProperty('_id');
            expect(result).not.toHaveProperty('createdAt');
            expect(result).toHaveProperty('mainCharacter');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('traits');
        });

        it('should validate form-specific constraints', () => {
            const formData = {
                mainCharacter: true,
                status: 'invalid-status'
            };

            expect(() => characterFormSchema.parse(formData)).toThrow();

            formData.status = 'alive';
            expect(() => characterFormSchema.parse(formData)).not.toThrow();
        });
    });
}); 