import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UniverseService } from '../UniverseService';
import { universes } from '../../collections';
import type { Universe } from '../../types';
import { ObjectId, type WithId, type DeleteResult } from 'mongodb';

// Mock the universes collection
vi.mock('../../collections', () => ({
    universes: {
        findOne: vi.fn(),
        find: vi.fn(),
        insertOne: vi.fn(),
        findOneAndUpdate: vi.fn(),
        deleteOne: vi.fn(),
        countDocuments: vi.fn()
    }
}));

describe('UniverseService', () => {
    let service: UniverseService;
    const mockUniverse: Universe = {
        _id: new ObjectId(),
        name: 'Test Universe',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        lastModifiedBy: 'test-user',
        llmContext: {
            shortDescription: 'Test short description'
        },
        creatorId: 'test-user',
        isPublic: false
    };

    beforeEach(() => {
        service = new UniverseService();
        vi.clearAllMocks();
    });

    describe('findById', () => {
        it('should find a universe by id', async () => {
            vi.mocked(universes.findOne).mockResolvedValue(mockUniverse);

            const result = await service.findById(mockUniverse._id!);

            expect(result).toEqual(mockUniverse);
            expect(universes.findOne).toHaveBeenCalledWith({ _id: mockUniverse._id });
        });

        it('should return null if universe not found', async () => {
            vi.mocked(universes.findOne).mockResolvedValue(null);

            const result = await service.findById(new ObjectId());

            expect(result).toBeNull();
        });
    });

    describe('findByCreator', () => {
        it('should find universes by creator', async () => {
            const mockItems = [mockUniverse];
            vi.mocked(universes.find).mockReturnValue({
                skip: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                        toArray: vi.fn().mockResolvedValue(mockItems)
                    })
                })
            } as any);
            vi.mocked(universes.countDocuments).mockResolvedValue(1);

            const result = await service.findByCreator('test-user');

            expect(result.items).toEqual(mockItems);
            expect(result.total).toBe(1);
            expect(universes.find).toHaveBeenCalledWith({ creatorId: 'test-user' });
        });
    });

    describe('findPublic', () => {
        it('should find public universes', async () => {
            const mockItems = [mockUniverse];
            vi.mocked(universes.find).mockReturnValue({
                skip: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                        toArray: vi.fn().mockResolvedValue(mockItems)
                    })
                })
            } as any);
            vi.mocked(universes.countDocuments).mockResolvedValue(1);

            const result = await service.findPublic();

            expect(result.items).toEqual(mockItems);
            expect(result.total).toBe(1);
            expect(universes.find).toHaveBeenCalledWith({ isPublic: true });
        });
    });

    describe('findAccessible', () => {
        it('should find accessible universes', async () => {
            const mockItems = [mockUniverse];
            vi.mocked(universes.find).mockReturnValue({
                skip: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                        toArray: vi.fn().mockResolvedValue(mockItems)
                    })
                })
            } as any);
            vi.mocked(universes.countDocuments).mockResolvedValue(1);

            const result = await service.findAccessible('test-user');

            expect(result.items).toEqual(mockItems);
            expect(result.total).toBe(1);
            expect(universes.find).toHaveBeenCalledWith({
                $or: [
                    { creatorId: 'test-user' },
                    { collaborators: 'test-user' },
                    { isPublic: true }
                ]
            });
        });
    });

    describe('create', () => {
        it('should create a new universe', async () => {
            const newUniverse = {
                name: 'New Universe',
                description: 'New Description',
                llmContext: {
                    shortDescription: 'New short description'
                },
                creatorId: 'test-user',
                lastModifiedBy: 'test-user',
                version: 1,
                isPublic: false
            };

            vi.mocked(universes.insertOne).mockResolvedValue({
                insertedId: new ObjectId(),
                acknowledged: true
            });

            const result = await service.create(newUniverse);

            expect(result).toHaveProperty('_id');
            expect(result).toHaveProperty('createdAt');
            expect(result).toHaveProperty('updatedAt');
            expect(result.name).toBe(newUniverse.name);
            expect(universes.insertOne).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update an existing universe', async () => {
            const update = {
                name: 'Updated Universe',
                description: 'Updated Description'
            };

            vi.mocked(universes.findOneAndUpdate).mockResolvedValue({
                _id: mockUniverse._id,
                ...mockUniverse,
                ...update,
                updatedAt: expect.any(Date)
            } as WithId<Universe>);

            const result = await service.update(mockUniverse._id!, update);

            expect(result).toMatchObject({
                ...mockUniverse,
                ...update
            });
            expect(universes.findOneAndUpdate).toHaveBeenCalled();
        });

        it('should return null if universe not found', async () => {
            vi.mocked(universes.findOneAndUpdate).mockResolvedValue(null);

            const result = await service.update(new ObjectId(), { name: 'Test' });

            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        it('should delete a universe', async () => {
            vi.mocked(universes.deleteOne).mockResolvedValue({ deletedCount: 1, acknowledged: true } as DeleteResult);

            const result = await service.delete(mockUniverse._id!);

            expect(result).toBe(true);
            expect(universes.deleteOne).toHaveBeenCalledWith({ _id: mockUniverse._id });
        });

        it('should return false if universe not found', async () => {
            vi.mocked(universes.deleteOne).mockResolvedValue({ deletedCount: 0, acknowledged: true } as DeleteResult);

            const result = await service.delete(new ObjectId());

            expect(result).toBe(false);
        });
    });
});