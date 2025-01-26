import type { Universe, Character, Plot } from '../mongodb/types';
import { error } from '@sveltejs/kit';

export function checkUniverseAccess(universe: Universe | null, userId: string | undefined) {
    if (!universe) {
        throw error(404, 'Universe not found');
    }
    if (!userId) {
        throw error(401, 'Unauthorized');
    }
    if (universe.creatorId !== userId && !universe.collaborators?.includes(userId)) {
        throw error(403, 'You do not have access to this universe');
    }
}

export function checkCharacterAccess(character: Character | null, userId: string | undefined) {
    if (!character) {
        throw error(404, 'Character not found');
    }
    if (!userId) {
        throw error(401, 'Unauthorized');
    }
    if (character.creatorId !== userId) {
        throw error(403, 'You do not have access to this character');
    }
}

export function checkPlotAccess(plot: Plot | null, userId: string | undefined) {
    if (!plot) {
        throw error(404, 'Plot not found');
    }
    if (!userId) {
        throw error(401, 'Unauthorized');
    }
    if (plot.creatorId !== userId) {
        throw error(403, 'You do not have access to this plot');
    }
}

export function ensureAuthenticated(userId: string | undefined) {
    if (!userId) {
        throw error(401, 'Unauthorized');
    }
    return userId;
} 