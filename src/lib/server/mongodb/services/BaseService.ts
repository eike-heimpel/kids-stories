import type { Collection, ObjectId, Filter, WithId, UpdateFilter, OptionalUnlessRequiredId } from 'mongodb';
import type { BaseDocument } from '../types';

export abstract class BaseService<T extends BaseDocument> {
    protected collection: Collection<T>;

    constructor(collection: Collection<T>) {
        this.collection = collection;
    }

    async findById(id: ObjectId): Promise<T | null> {
        const result = await this.collection.findOne({ _id: id } as Filter<T>);
        return result && (result as WithId<T>) as T;
    }

    async findOne(filter: Filter<T>): Promise<T | null> {
        const result = await this.collection.findOne(filter);
        return result && (result as WithId<T>) as T;
    }

    async find(filter: Filter<T> = {}, page = 1, limit = 10): Promise<{ items: T[]; total: number }> {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.collection.find(filter).skip(skip).limit(limit).toArray(),
            this.collection.countDocuments(filter)
        ]);

        return { items: (items as WithId<T>[]) as T[], total };
    }

    async create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt' | 'version' | 'lastModifiedBy'> & { creatorId: string }): Promise<T> {
        const now = new Date();
        const doc = {
            ...data,
            createdAt: now,
            updatedAt: now,
            version: 1,
            lastModifiedBy: data.creatorId
        };

        const result = await this.collection.insertOne(doc as unknown as OptionalUnlessRequiredId<T>);
        return {
            ...doc,
            _id: result.insertedId
        } as unknown as T;
    }

    async update(id: ObjectId, update: Partial<Omit<T, '_id' | 'createdAt'>> & { lastModifiedBy: string }): Promise<T | null> {
        const result = await this.collection.findOneAndUpdate(
            { _id: id } as Filter<T>,
            {
                $set: {
                    ...update,
                    updatedAt: new Date()
                },
                $inc: { version: 1 }
            } as unknown as UpdateFilter<T>,
            { returnDocument: 'after' }
        );

        return result && (result as WithId<T>) as T;
    }

    async delete(id: ObjectId): Promise<boolean> {
        const result = await this.collection.deleteOne({ _id: id } as Filter<T>);
        return result.deletedCount === 1;
    }
}
