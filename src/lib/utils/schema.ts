import type { z } from 'zod';

export function isFieldRequired(schema: z.ZodType<any>, path: string): boolean {
    try {
        // Handle nested paths (e.g., 'llmContext.shortDescription')
        const pathParts = path.split('.');
        let currentSchema: any = schema;

        for (const part of pathParts) {
            if (!currentSchema.shape) {
                console.log('No shape found in schema for part:', part);
                return false;
            }
            currentSchema = currentSchema.shape[part];
        }

        // Check if the field is optional or nullable
        const isOptional =
            currentSchema?.isOptional?.() ||
            currentSchema?._def?.typeName === 'ZodOptional' ||
            currentSchema?.isNullable?.() ||
            currentSchema?._def?.typeName === 'ZodNullable';

        return !isOptional;
    } catch (error) {
        console.error('Error checking if field is required:', error);
        return false;
    }
}

export function getFieldType(schema: z.ZodType<any>, path: string): string {
    try {
        const pathParts = path.split('.');
        let currentSchema: any = schema;

        for (const part of pathParts) {
            if (!currentSchema.shape) return 'unknown';
            currentSchema = currentSchema.shape[part];
        }

        return currentSchema?._def?.typeName?.replace('Zod', '').toLowerCase() || 'unknown';
    } catch {
        return 'unknown';
    }
}

export function getFieldValidation(schema: z.ZodType<any>, path: string): Record<string, any> {
    try {
        const pathParts = path.split('.');
        let currentSchema: any = schema;

        for (const part of pathParts) {
            if (!currentSchema.shape) return {};
            currentSchema = currentSchema.shape[part];
        }

        const validation: Record<string, any> = {};

        // Extract min/max constraints
        if (currentSchema?._def?.checks) {
            for (const check of currentSchema._def.checks) {
                if (check.kind === 'min') validation.min = check.value;
                if (check.kind === 'max') validation.max = check.value;
            }
        }

        // Extract regex patterns
        if (currentSchema?._def?.pattern) {
            validation.pattern = currentSchema._def.pattern;
        }

        return validation;
    } catch {
        return {};
    }
}

export function getObjectFields(schema: z.ZodType<any>, path: string): string[] {
    try {
        const pathParts = path.split('.');
        let currentSchema: any = schema;

        for (const part of pathParts) {
            if (!currentSchema.shape) return [];
            currentSchema = currentSchema.shape[part];
        }

        if (currentSchema?.shape) {
            return Object.keys(currentSchema.shape);
        }

        return [];
    } catch {
        return [];
    }
} 