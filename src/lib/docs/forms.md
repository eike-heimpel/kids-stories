# Form System Documentation

## Overview
The form system is built on Zod schemas and provides automatic validation, required field indicators, and reusable components.

## Components

### FormField
Basic input field component that automatically handles:
- Required field indicators
- Validation errors
- Different input types (text, textarea, number, url)

```typescript
<FormField
    schema={entitySchema}
    path="fieldName"
    label="Field Label"
    type="text"
    bind:value={entity.field}
    validation={validation}
/>
```

### ArrayField
Component for handling array fields (like tags, genres) that:
- Converts comma-separated input to arrays
- Handles validation
- Maintains consistent formatting

```typescript
<ArrayField
    schema={entitySchema}
    path="arrayField"
    label="Array Field"
    bind:value={entity.arrayField}
    validation={validation}
    placeholder="Value 1, Value 2, etc."
/>
```

### ObjectField
Component for nested objects that:
- Handles multiple related fields
- Maintains object structure
- Provides field-level validation

```typescript
<ObjectField
    schema={entitySchema}
    path="objectField"
    label="Object Field"
    bind:value={entity.objectField}
    validation={validation}
    fields={[
        { key: 'subField1', label: 'Sub Field 1', type: 'text' },
        { key: 'subField2', label: 'Sub Field 2', type: 'number' }
    ]}
/>
```

## Schema System

### Base Schema
All entity schemas extend the base schema which provides:
- Common fields (name, description, etc.)
- Base validation rules
- Type definitions

### Form Schemas
Form-specific schemas are created using `createFormSchema` which:
- Removes server-only fields
- Adds form-specific validation
- Maintains type safety

### Validation
The validation system:
- Uses Zod for schema validation
- Provides real-time feedback
- Handles nested fields
- Supports custom validation rules

## Best Practices

1. **Schema Definition**
   - Define base schema first
   - Add form-specific validation
   - Export types from schemas

2. **Component Usage**
   - Use appropriate field components
   - Pass the base schema for required checks
   - Handle validation state changes

3. **Type Safety**
   - Use schema-derived types
   - Validate form data before submission
   - Handle all error cases

4. **Extensibility**
   - Follow the pattern for new entities
   - Reuse components where possible
   - Maintain consistent validation 