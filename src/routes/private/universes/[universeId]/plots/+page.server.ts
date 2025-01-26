import { error } from '@sveltejs/kit';
import { PlotService } from '$lib/server/mongodb/services/PlotService';
import type { PageServerLoad } from './$types';

const plotService = new PlotService();

interface LoadParams {
    params: {
        universeId: string;
    };
}

export const load: PageServerLoad = async ({ params }: LoadParams) => {
    try {
        const result = await plotService.findByUniverse(params.universeId);
        return {
            plots: {
                ...result,
                items: result.items.map(plot => ({
                    ...plot,
                    _id: plot._id?.toString() ?? ''
                }))
            }
        };
    } catch (err) {
        console.error('Error loading plots:', err);
        throw error(500, 'Failed to load plots');
    }
};