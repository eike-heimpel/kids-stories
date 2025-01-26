import { error } from '@sveltejs/kit';
import { PlotService } from '$lib/server/mongodb/services/PlotService';
import type { PageServerLoad, Actions } from './$types';
import type { Plot } from '$lib/schemas/plot';
import { ObjectId } from 'mongodb';

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

export const actions: Actions = {
    create: async ({ request, params }) => {
        const formData = await request.json();
        try {
            // For new plots
            if (!formData._id) {
                const result = await plotService.create({
                    ...formData,
                    universeId: params.universeId
                });
                return {
                    success: true,
                    plot: {
                        ...result,
                        _id: result._id?.toString() ?? ''
                    }
                };
            }

            // For existing plots
            const result = await plotService.update(
                new ObjectId(formData._id),
                formData
            );
            return {
                success: true,
                plot: result ? {
                    ...result,
                    _id: result._id?.toString() ?? ''
                } : null
            };
        } catch (err) {
            console.error('Error saving plot:', err);
            return {
                success: false,
                error: 'Failed to save plot'
            };
        }
    }
}; 