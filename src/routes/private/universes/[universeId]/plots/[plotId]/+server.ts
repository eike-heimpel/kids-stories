import { json } from '@sveltejs/kit';
import { PlotService } from '$lib/server/mongodb/services/PlotService';
import { UniverseService } from '$lib/server/mongodb/services/UniverseService';
import { checkUniverseAccess, checkPlotAccess } from '$lib/server/auth/guards';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';

const plotService = new PlotService();
const universeService = new UniverseService();

export const PUT: RequestHandler = async ({ request, params, locals }) => {
    const { plotId } = params;
    const userId = locals.user?.id;

    try {
        const data = await request.json();
        const plot = await plotService.findById(new ObjectId(plotId));

        if (!plot) {
            return new Response('Plot not found', { status: 404 });
        }

        // Check access
        checkPlotAccess(plot, userId);

        // Remove fields that shouldn't be updated directly
        const { _id, createdAt, updatedAt, version, ...updateData } = data;

        // Update plot
        const updatedPlot = await plotService.update(new ObjectId(plotId), {
            ...updateData,
            lastModifiedBy: userId
        });

        if (!updatedPlot || !updatedPlot._id) {
            return new Response('Failed to update plot', { status: 500 });
        }

        // Convert ObjectId to string for serialization
        return json({
            ...updatedPlot,
            _id: updatedPlot._id.toString()
        });
    } catch (error) {
        console.error('Error updating plot:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
    const { universeId, plotId } = params;
    const userId = locals.user?.id;

    // Verify universe access
    const universe = await universeService.findById(new ObjectId(universeId));
    checkUniverseAccess(universe, userId);

    // Verify plot exists and belongs to universe
    const existingPlot = await plotService.findById(new ObjectId(plotId));
    if (!existingPlot || existingPlot.universeId !== universeId) {
        return new Response('Plot not found in this universe', { status: 404 });
    }

    // Verify plot access
    checkPlotAccess(existingPlot, userId);

    try {
        const success = await plotService.delete(new ObjectId(plotId));
        if (!success) {
            return new Response('Failed to delete plot', { status: 500 });
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting plot:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}; 