import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
    const path = url.pathname;
    const breadcrumbs = [{ label: 'Universes', href: '/private/universes' }];

    if (path.includes('/new')) {
        breadcrumbs.push({ label: 'Create New', href: path });
    } else if (path.includes('/edit')) {
        const baseUrl = path.replace('/edit', '');
        breadcrumbs.push(
            { label: 'View', href: baseUrl },
            { label: 'Edit', href: path }
        );
    } else if (path.includes('/universes/')) {
        breadcrumbs.push({ label: 'View', href: path });
    }

    return {
        breadcrumbs
    };
}; 