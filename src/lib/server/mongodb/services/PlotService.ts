import { ObjectId, type Filter } from 'mongodb';
import { BaseService } from './BaseService';
import { plots } from '../collections';
import type { Plot } from '../types';

export class PlotService extends BaseService<Plot> {
    constructor() {
        super(plots);
    }

    // Find plots by universe
    async findByUniverse(universeId: string, page = 1, limit = 10) {
        return this.find({ universeId } as Filter<Plot>, page, limit);
    }

    // Find plots by status
    async findByStatus(universeId: string, status: Plot['status'], page = 1, limit = 10) {
        return this.find({
            universeId,
            status
        } as Filter<Plot>, page, limit);
    }

    // Find plots by character
    async findByCharacter(universeId: string, characterId: string, page = 1, limit = 10) {
        return this.find({
            universeId,
            mainCharacters: characterId
        } as Filter<Plot>, page, limit);
    }

    // Find plots by tag
    async findByTag(universeId: string, tag: string, page = 1, limit = 10) {
        return this.find({
            universeId,
            tags: tag
        } as Filter<Plot>, page, limit);
    }

    // Find plots by time period
    async findByTimePeriod(universeId: string, startDate: Date, endDate: Date, page = 1, limit = 10) {
        return this.find({
            universeId,
            'timeframe.start': { $lte: endDate },
            $or: [
                { 'timeframe.end': { $gte: startDate } },
                { 'timeframe.end': { $exists: false } }
            ]
        } as Filter<Plot>, page, limit);
    }

    // Find plots by location
    async findByLocation(universeId: string, locationId: string, page = 1, limit = 10) {
        return this.find({
            universeId,
            'plotPoints.location.primary': locationId
        } as Filter<Plot>, page, limit);
    }

    // Search plots by title or summary
    async search(universeId: string, query: string, page = 1, limit = 10) {
        return this.find({
            universeId,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { summary: { $regex: query, $options: 'i' } }
            ]
        } as Filter<Plot>, page, limit);
    }

    // Get basic info for plots (used in listings)
    async getBasicInfo(universeId: string) {
        const plots = await this.collection
            .find({ universeId }, {
                projection: {
                    _id: 1,
                    title: 1,
                    status: 1,
                    tags: 1,
                    mainCharacters: 1
                }
            })
            .toArray();

        return plots.map(plot => ({
            _id: plot._id.toString(),
            name: plot.title,
            type: 'plot' as const,
            displayInfo: {
                status: plot.status,
                tags: plot.tags,
                mainCharacterCount: plot.mainCharacters?.length || 0
            }
        }));
    }
} 