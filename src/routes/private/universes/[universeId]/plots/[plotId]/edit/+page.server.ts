import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
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

export const actions: Actions = {
    save: async ({ request, params }) => {
        const formData = await request.formData();
        const data = JSON.parse(formData.get('data') as string);

        try {
            const result = await plotService.update(
                new ObjectId(data._id),
                {
                    ...data,
                    lastModifiedBy: data.creatorId // Required by BaseService
                }
            );

            if (!result || !result._id) {
                return {
                    success: false,
                    error: 'Failed to update plot'
                };
            }

            return {
                success: true,
                plot: {
                    ...result,
                    _id: result._id.toString()
                }
            };
        } catch (err) {
            console.error('Error updating plot:', err);
            return {
                success: false,
                error: 'Failed to update plot'
            };
        }
    }
};