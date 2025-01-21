# Schema and Validation System Documentation

## Overview

This document outlines the schema and validation system used throughout the application. The system is built on Zod for type-safe schema validation and provides a consistent pattern for handling data across both client and server sides.

## Core Components

### Base Schemas (`src/lib/schemas/base.ts`)

The foundation of our schema system consists of several base schemas that are extended by entity-specific schemas:

1. **Base Document Schema**
   ```typescript
   baseDocumentSchema = {
     _id: optional
     createdAt: date
     updatedAt: date
     version: number
     lastModifiedBy: string
     creatorId: string
   }
   ```
   Used for server-side document validation and includes metadata fields.

2. **Common Fields Schema**
   ```typescript
   commonFieldsSchema = {
     name: string (required)
     description: string (required)
     isPublic: boolean
     llmContext: LLMContextSchema
   }
   ```
   Shared fields across most entities.

3. **LLM Context Schema**
   ```typescript
   llmContextSchema = {
     shortDescription: string (optional)
     longDescription: string (optional)
     keyPoints: string[] (optional)
     relationships: string (optional)
     hiddenInformation: string (optional)
     storyImplications: string (optional)
     tone: string (optional)
     systemNotes: string (optional)
   }
   ```
   Used for AI/LLM-related metadata and context.

### Entity-Specific Schemas

Each entity (e.g., Character, Universe) has its own schema file that extends the base schemas. They follow a consistent pattern:

1. **Entity Fields Schema**: Defines fields specific to the entity
2. **Full Entity Schema**: Combines base document schema, common fields, and entity-specific fields
3. **Form Schema**: Client-side version for form validation

Example (Character):
```typescript
// Entity-specific fields
const characterFieldsSchema = {
  mainCharacter: boolean
  status: enum['alive', 'deceased', 'unknown']
  backstory: string (optional)
  traits: string[]
  // ... other fields
}

// Full server-side schema
const characterSchema = baseDocumentSchema
  .merge(commonFieldsSchema)
  .merge(characterFieldsSchema)
  .extend({ universeId: string })

// Client-side form schema
const characterFormSchema = createFormSchema(characterFieldsSchema)
```

## Validation System

### Form Validation

1. **Form Components**
   - `EntityForm.svelte`: Base form component that handles common fields and validation
   - Entity-specific forms (e.g., `CharacterForm.svelte`, `UniverseForm.svelte`) extend `EntityForm`
   - Forms use Zod schemas for real-time validation

2. **Validation Store**
   ```typescript
   const validation = createFormValidation(schema)
   ```
   - Provides reactive validation state
   - Tracks field errors and overall form validity
   - Used by form components to display validation messages

### AI Service Validation

The `AIService` class uses schemas to:
1. Validate AI-generated content against entity schemas
2. Ensure LLM context follows the defined structure
3. Generate type-safe responses for AI assist features

## Best Practices

1. **Schema Definition**
   - Keep schemas modular and composable
   - Use Zod's type inference for TypeScript types
   - Define clear validation rules and error messages

2. **Form Implementation**
   - Use the `EntityForm` base component for consistency
   - Implement entity-specific validation in form components
   - Handle both client and server-side validation

3. **Type Safety**
   - Use inferred types from schemas:
     ```typescript
     type Character = z.infer<typeof characterSchema>
     type CharacterForm = z.infer<typeof characterFormSchema>
     ```
   - Leverage TypeScript for compile-time type checking

4. **Validation Flow**
   - Client-side: Form validation using form schemas
   - Server-side: Full schema validation before database operations
   - AI Service: Schema validation for generated content

## Example Usage

### Form Component
```typescript
<EntityForm
  entity={character}
  entityType="character"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  validation={validation}
>
  <!-- Entity-specific fields -->
</EntityForm>
```

### Validation in Components
```typescript
const validation = createFormValidation(characterFormSchema)

function handleChange() {
  validation.validate(character)
}

function handleSubmit() {
  if (validation.validate(character)) {
    // Process valid form data
  }
}
```

### AI Service Validation
```typescript
protected validateResponse(response: Record<string, any>): boolean {
  // Validate LLM context
  if (response.llmContext && !this.validateLLMContext(response.llmContext)) {
    return false
  }
  
  // Validate entity-specific fields
  return this.validateEntitySpecificFields(response)
}
```

## Source of Truth

1. **Schema Definitions**: Base schemas in `src/lib/schemas/base.ts` serve as the foundation
2. **Entity Schemas**: Each entity's schema file is the source of truth for that entity's structure
3. **Type Definitions**: Generated from schemas using Zod's type inference
4. **Validation Rules**: Defined in schemas and enforced consistently across the application

## Future Considerations

1. **Schema Evolution**
   - Plan for schema versioning
   - Consider migration strategies
   - Document breaking changes

2. **Performance**
   - Monitor validation performance
   - Consider caching validation results
   - Optimize validation for large forms

3. **Extensibility**
   - Keep schemas modular for easy extension
   - Document schema extension patterns
   - Consider plugin system for custom validations 