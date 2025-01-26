import { PlotService } from '$lib/server/mongodb/services/PlotService';
import { ObjectId } from 'mongodb';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const plotService = new PlotService();

export const load: PageServerLoad = async ({ params, parent }) => {
    const parentData = await parent();
    const universe = parentData.universe;

    if (!universe?._id) {
        throw error(404, 'Universe not found');
    }

    const plot = await plotService.findById(new ObjectId(params.plotId));

    // Verify plot belongs to this universe
    if (!plot || plot.universeId !== universe._id.toString()) {
        throw error(404, 'Plot not found in this universe');
    }

    // Convert ObjectId to string for serialization
    return {
        plot: {
            ...plot,
            _id: plot._id?.toString() ?? ''
        }
    };
}; 