import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
    const path = url.pathname;
    const universeId = url.searchParams.get('universeId');
    const basePath = `/private/characters${universeId ? `?universeId=${universeId}` : ''}`;
    const breadcrumbs = [{ label: 'Characters', href: basePath }];

    if (path.includes('/new')) {
        breadcrumbs.push({ label: 'Create New', href: path });
    } else if (path.includes('/edit')) {
        const baseUrl = path.replace('/edit', '');
        breadcrumbs.push(
            { label: 'View', href: baseUrl },
            { label: 'Edit', href: path }
        );
    } else if (path.includes('/characters/')) {
        breadcrumbs.push({ label: 'View', href: path });
    }

    return {
        breadcrumbs
    };
}; 