import type { Collection, ObjectId, Filter, WithId, UpdateFilter, OptionalUnlessRequiredId } from 'mongodb';
import type { BaseDocument, SafeUpdateFields, ImmutableFields, SystemManagedFields } from '../types';

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

    async update(id: ObjectId, update: Partial<SafeUpdateFields<T>> & { lastModifiedBy: string }): Promise<T | null> {
        // Ensure we're not trying to update any immutable or system-managed fields
        const { lastModifiedBy, _id, createdAt, version, updatedAt, ...updateData } = update as any;

        // Get the current document to ensure we have the correct version
        const current = await this.findById(id);
        if (!current) {
            return null;
        }

        const result = await this.collection.findOneAndUpdate(
            {
                _id: id,
                version: current.version // Optimistic concurrency control
            } as Filter<T>,
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date(),
                    lastModifiedBy
                },
                $inc: { version: 1 }
            } as unknown as UpdateFilter<T>,
            {
                returnDocument: 'after',
                upsert: false // Never create a new document
            }
        );

        return result && (result as WithId<T>) as T;
    }

    async delete(id: ObjectId): Promise<boolean> {
        const result = await this.collection.deleteOne({ _id: id } as Filter<T>);
        return result.deletedCount === 1;
    }
}
