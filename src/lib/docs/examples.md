# Schema Usage Examples

## Creating New Entities

### Creating a Character
```typescript
import { characterSchema, type Character } from '$lib/schemas/character';

const newCharacter = {
    name: "Gandalf",
    description: "A wise wizard",
    isPublic: true,
    mainCharacter: true,
    status: "alive",
    species: "Wizard",
    traits: ["wise", "powerful", "mysterious"],
    abilities: ["magic", "leadership", "wisdom"],
    llmContext: {
        shortDescription: "Ancient wizard guiding the fellowship"
    }
};

// Validate the data
const validatedCharacter = characterSchema.parse(newCharacter);
```

### Creating a Universe
```typescript
import { universeSchema, type Universe } from '$lib/schemas/universe';

const newUniverse = {
    name: "Middle Earth",
    description: "A fantasy world of magic and adventure",
    isPublic: true,
    language: "English",
    genre: ["fantasy", "epic"],
    tags: ["magic", "adventure"],
    targetAgeRange: { min: 12, max: 99 },
    llmContext: {
        shortDescription: "Epic fantasy world with rich lore"
    }
};

// Validate the data
const validatedUniverse = universeSchema.parse(newUniverse);
```

## Form Validation

### Using Form Schemas
```typescript
import { characterFormSchema } from '$lib/schemas/character';
import { createFormValidation } from '$lib/stores/formValidation';

// Create a validation store
const validation = createFormValidation(characterFormSchema);

// Validate form data
function handleSubmit(formData) {
    if (validation.validate(formData)) {
        // Data is valid, proceed with submission
        saveCharacter(formData);
    }
}
```

## API Validation

### Route Parameter Validation
```typescript
import { validateParams } from '$lib/server/middleware/validateSchema';
import { z } from 'zod';

export const GET = async (event) => {
    const paramsSchema = z.object({
        universeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')
    });
    
    const { universeId } = await validateParams(paramsSchema)(event);
    // universeId is now validated
};
```

### Query Parameter Validation
```typescript
import { validateQuery } from '$lib/server/middleware/validateSchema';
import { z } from 'zod';

export const GET = async (event) => {
    const querySchema = z.object({
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
        offset: z.string().regex(/^\d+$/).transform(Number).optional(),
        search: z.string().optional()
    });
    
    const query = await validateQuery(querySchema)(event);
    // query parameters are now validated and transformed
};
```

## Error Handling

### Handling Validation Errors
```typescript
import { ZodError } from 'zod';
import { characterSchema } from '$lib/schemas/character';

try {
    const validatedData = characterSchema.parse(inputData);
    // Data is valid
} catch (err) {
    if (err instanceof ZodError) {
        // Handle validation errors
        const errors = err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        }));
        console.error('Validation errors:', errors);
    }
}
``` 