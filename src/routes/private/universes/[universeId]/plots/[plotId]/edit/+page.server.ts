import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PlotService } from '$lib/server/mongodb/services/PlotService';
import { ObjectId } from 'mongodb';

const plotService = new PlotService();

export const load: PageServerLoad = async ({ params, parent }) => {
    const { universeId, plotId } = params;
    const parentData = await parent();

    const plot = await plotService.findById(new ObjectId(plotId));

    if (!plot || plot.universeId !== universeId || !plot._id) {
        throw error(404, 'Plot not found');
    }

    // Convert ObjectId to string for serialization
    return {
        plot: {
            ...plot,
            _id: plot._id.toString()
        },
        universe: parentData.universe
    };
}; 