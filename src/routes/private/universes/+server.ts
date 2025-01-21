import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { validateBody, validateQuery } from '$lib/server/middleware/validateSchema';
import { universeSchema } from '$lib/schemas/universe';
import { z } from 'zod';

/** GET /private/universes - List universes */
export const GET: RequestHandler = async (event) => {
    // Example of query parameter validation
    const querySchema = z.object({
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
        offset: z.string().regex(/^\d+$/).transform(Number).optional(),
        search: z.string().optional()
    });

    const query = await validateQuery(querySchema)(event);

    // Process validated query parameters...
    // Your existing universe listing logic here

    return json({ success: true, query });
};

/** POST /private/universes - Create a new universe */
export const POST: RequestHandler = async (event) => {
    // Validate request body against universe schema
    const data = await validateBody(universeSchema)(event);

    // Process validated data...
    // Your existing universe creation logic here

    return json({ success: true, data });
};