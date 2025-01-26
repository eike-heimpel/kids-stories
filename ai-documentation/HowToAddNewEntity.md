## How to Add a New Entity

This guide outlines the steps required to add a new entity to the system. Follow these steps in order to ensure proper integration.

### 1. Schema Definition (src/lib/schemas/[entity].ts)

1. Import base schemas:
```typescript
import { z } from 'zod';
import { baseDocumentSchema, llmContextSchema, commonFieldsSchema, createFormSchema } from './base';
```

2. Create entity-specific field schemas (if needed)
3. Create the main entity schema by merging base schemas
4. Create the form schema using createFormSchema
5. Export types derived from schemas

Example structure:
```typescript
// Entity-specific field schemas (if needed)
const specificFieldSchema = z.object({...});

// Main entity schema
export const entitySchema = baseDocumentSchema
    .merge(commonFieldsSchema)
    .merge(specificFieldSchema);

// Form schema
export const entityFormSchema = createFormSchema(specificFieldSchema);

// Export types
export type Entity = z.infer<typeof entitySchema>;
export type EntityForm = z.infer<typeof entityFormSchema>;
```

### 2. MongoDB Service (src/lib/server/mongodb/services/[Entity]Service.ts)

1. Create a new service class extending BaseService
2. Implement entity-specific query methods
3. Add getBasicInfo method for entity listing

Example structure:
```typescript
import { BaseService } from './BaseService';
import { entities } from '../collections';
import type { Entity } from '../types';

export class EntityService extends BaseService<Entity> {
    constructor() {
        super(entities);
    }

    // Add entity-specific query methods
    async findByUniverse(universeId: string, page = 1, limit = 10) {
        return this.find({ universeId }, page, limit);
    }

    // Add getBasicInfo for entity listing
    async getBasicInfo(universeId: string) {
        const items = await this.collection
            .find({ universeId }, {
                projection: {
                    _id: 1,
                    name: 1,
                    // Add other basic fields
                }
            })
            .toArray();

        return items.map(item => ({
            _id: item._id.toString(),
            name: item.name,
            type: 'entityType' as const,
            displayInfo: {
                // Add relevant display info
            }
        }));
    }
}
```

### 3. AI Service (src/lib/server/ai/services/[Entity]AIService.ts)

1. Create new AI service class extending AIService
2. Implement required methods:
   - getEntitySchema()
   - validateEntitySpecificFields()
   - formatEntitySpecificPrompt()

Example structure:
```typescript
import { AIService } from '../AIService';
import type { AIAssistRequest, EntitySchema } from '../types';
import type { Entity } from '../../mongodb/types';

export class EntityAIService extends AIService {
    protected getEntitySchema(): EntitySchema {
        return {
            type: 'object',
            description: 'Description of the entity',
            required: ['name', 'description', 'llmContext'],
            properties: {
                // Define entity properties
            }
        };
    }

    protected validateEntitySpecificFields(response: Record<string, any>): boolean {
        // Implement validation logic
        return true;
    }

    protected formatEntitySpecificPrompt(request: AIAssistRequest): string {
        // Format entity-specific prompt
        return '';
    }
}
```

### 4. UI Components (src/lib/components/[entity]/)

1. Create EntityForm.svelte:
   - Import schemas and types
   - Define form fields
   - Handle validation and submission

2. Create EntityFormPage.svelte:
   - Import required components
   - Set up routing and data flow
   - Handle form submission and navigation

Example structure:
```svelte
<!-- EntityForm.svelte -->
<script lang="ts">
    import { entityFormSchema, type Entity } from '$lib/schemas/entity';
    import { createFormValidation } from '$lib/stores/formValidation';
    import EntityForm from '../shared/EntityForm.svelte';
    
    export let entity: Entity;
    export let onSubmit: (data: Entity) => void;
    export let onCancel: () => void;
    
    const validation = createFormValidation(entityFormSchema);
</script>

<EntityForm
    {entity}
    entityType="entityType"
    {onSubmit}
    {onCancel}
    {validation}
    on:aichanges={handleAIChanges}
>
    <!-- Add form fields -->
</EntityForm>
```

### 5. Routes and API Endpoints

1. Create API routes:
   - CRUD operations
   - AI assist endpoint

2. Create page routes:
   - List view
   - Create/Edit forms
   - Detail view

Example structure:
```typescript
// API route
export const POST = async ({ request, params }) => {
    // Handle entity creation
};

// Page route
export const load = async ({ params }) => {
    // Load entity data
};
```

### 6. Update Collections (src/lib/server/mongodb/collections.ts)

Add the new entity collection:
```typescript
export const entities = db.collection<Entity>('entities');
```

### 7. Testing

1. Create unit tests for:
   - Schema validation
   - Service methods
   - AI service methods
2. Create integration tests for:
   - API endpoints
   - Form submission
   - Data persistence

### Best Practices

1. Keep schemas focused and well-documented
2. Implement proper validation at all levels
3. Use TypeScript types consistently
4. Follow existing patterns for consistency
5. Keep components modular and reusable
6. Document all public methods and interfaces
7. Handle errors gracefully with user feedback
8. Use the toast store for notifications
9. Maintain theme-agnostic UI using DaisyUI
10. Keep AI prompts clear and structured 