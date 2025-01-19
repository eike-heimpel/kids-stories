import type { Collection } from 'mongodb';
import { mongodb } from './client';
import type { User, Universe } from './types';
import { MONGO_DB_DATABASE } from '$env/static/private';

if (!MONGO_DB_DATABASE) {
    throw new Error('MONGO_DB_DATABASE environment variable is not set');
}

// Get database instance
const db = mongodb.db(MONGO_DB_DATABASE);

// Export collections
export const users: Collection<User> = db.collection('users');
export const universes: Collection<Universe> = db.collection('universes');
