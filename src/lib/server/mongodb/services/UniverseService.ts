import { ObjectId, type Filter } from 'mongodb';
import { BaseService } from './BaseService';
import { universes } from '../collections';
import type { Universe } from '../types';

export class UniverseService extends BaseService<Universe> {
    constructor() {
        super(universes);
    }

    // Find universes by creator
    async findByCreator(creatorId: string, page = 1, limit = 10) {
        return this.find({ creatorId } as Filter<Universe>, page, limit);
    }

    // Find all public universes
    async findPublic(page = 1, limit = 10) {
        return this.find({ isPublic: true } as Filter<Universe>, page, limit);
    }

    // Find universes accessible to a user (created by, collaborator of, or public)
    async findAccessible(userId: string, page = 1, limit = 10) {
        return this.find({
            $or: [
                { creatorId: userId },
                { collaborators: userId },
                { isPublic: true }
            ]
        } as Filter<Universe>, page, limit);
    }

    // Find universes by genre
    async findByGenre(genre: string, page = 1, limit = 10) {
        return this.find({ genre: genre } as Filter<Universe>, page, limit);
    }

    // Find universes by tag
    async findByTag(tag: string, page = 1, limit = 10) {
        return this.find({ tags: tag } as Filter<Universe>, page, limit);
    }

    // Search universes by name or description
    async search(query: string, page = 1, limit = 10) {
        return this.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        } as Filter<Universe>, page, limit);
    }
}