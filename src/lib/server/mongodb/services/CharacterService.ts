import { ObjectId, type Filter } from 'mongodb';
import { BaseService } from './BaseService';
import { characters } from '../collections';
import type { Character } from '../types';

export class CharacterService extends BaseService<Character> {
    constructor() {
        super(characters);
    }

    // Find characters by universe
    async findByUniverse(universeId: string, page = 1, limit = 10) {
        return this.find({ universeId } as Filter<Character>, page, limit);
    }

    // Find main characters in a universe
    async findMainCharacters(universeId: string, page = 1, limit = 10) {
        return this.find({
            universeId,
            mainCharacter: true
        } as Filter<Character>, page, limit);
    }

    // Find characters by status
    async findByStatus(universeId: string, status: Character['status'], page = 1, limit = 10) {
        return this.find({
            universeId,
            status
        } as Filter<Character>, page, limit);
    }

    // Find characters by species
    async findBySpecies(universeId: string, species: string, page = 1, limit = 10) {
        return this.find({
            universeId,
            species
        } as Filter<Character>, page, limit);
    }

    // Find characters by location
    async findByLocation(universeId: string, locationId: string, page = 1, limit = 10) {
        return this.find({
            universeId,
            'lastKnownLocation.locationId': locationId
        } as Filter<Character>, page, limit);
    }

    // Search characters by name or description
    async search(universeId: string, query: string, page = 1, limit = 10) {
        return this.find({
            universeId,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { backstory: { $regex: query, $options: 'i' } }
            ]
        } as Filter<Character>, page, limit);
    }

    // Find characters by tag
    async findByTag(universeId: string, tag: string, page = 1, limit = 10) {
        return this.find({
            universeId,
            tags: tag
        } as Filter<Character>, page, limit);
    }

    // Find characters by ability
    async findByAbility(universeId: string, ability: string, page = 1, limit = 10) {
        return this.find({
            universeId,
            abilities: ability
        } as Filter<Character>, page, limit);
    }

    // Find characters by relationship
    async findByRelationship(universeId: string, relatedCharacterId: string, page = 1, limit = 10) {
        return this.find({
            universeId,
            'relationships.characterId': relatedCharacterId
        } as Filter<Character>, page, limit);
    }
} 