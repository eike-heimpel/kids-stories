import type { RequestEvent } from '@sveltejs/kit';
import { ZodError, type AnyZodObject } from 'zod';
import { error } from '@sveltejs/kit';

/**
 * Middleware to validate request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param getData - Function to extract data from the request
 * @returns Validated data of type T
 * @throws 400 error if validation fails
 */
export async function validateSchema<T extends AnyZodObject>(
    event: RequestEvent,
    schema: T,
    getData: (event: RequestEvent) => Promise<unknown> | unknown = async (e) => await e.request.json()
): Promise<T['_output']> {
    try {
        const data = await getData(event);
        return await schema.parseAsync(data);
    } catch (err) {
        console.error('Validation error:', err);
        if (err instanceof ZodError) {
            throw error(400, new Error('Validation failed: ' + err.issues.map(i => i.message).join(', ')));
        }
        throw error(400, new Error('Invalid request data'));
    }
}

/**
 * Helper to validate query parameters against a schema
 * @param schema - Zod schema for query parameters
 */
export function validateQuery<T extends AnyZodObject>(schema: T) {
    return (event: RequestEvent) => validateSchema(event, schema, (e) => Object.fromEntries(e.url.searchParams));
}

/**
 * Helper to validate request body against a schema
 * @param schema - Zod schema for request body
 */
export function validateBody<T extends AnyZodObject>(schema: T) {
    return (event: RequestEvent) => validateSchema(event, schema);
}

/**
 * Helper to validate route parameters against a schema
 * @param schema - Zod schema for route parameters
 */
export function validateParams<T extends AnyZodObject>(schema: T) {
    return (event: RequestEvent) => validateSchema(event, schema, (e) => e.params);
} 