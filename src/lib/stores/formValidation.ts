import { writable, type Writable, get } from 'svelte/store';
import type { z } from 'zod';

export interface ValidationError {
    path: (string | number)[];
    message: string;
}

export interface ValidationState {
    errors: ValidationError[];
    isValid: boolean;
    getFieldError: (path: string | string[]) => string | undefined;
}

export function createFormValidation<T>(schema: z.ZodType<T>) {
    function getFieldError(path: string | string[]): string | undefined {
        const current = get(store);
        const pathArray = Array.isArray(path) ? path : path.split('.');
        return current.errors.find(err =>
            err.path.join('.') === pathArray.join('.')
        )?.message;
    }

    const store: Writable<ValidationState> = writable({
        errors: [],
        isValid: true,
        getFieldError
    });

    function validate(data: unknown) {
        const result = schema.safeParse(data);

        if (!result.success) {
            const errors = result.error.errors.map(err => ({
                path: err.path,
                message: err.message
            }));

            store.set({
                errors,
                isValid: false,
                getFieldError
            });
            return false;
        }

        store.set({
            errors: [],
            isValid: true,
            getFieldError
        });
        return true;
    }

    function reset() {
        store.set({
            errors: [],
            isValid: true,
            getFieldError
        });
    }

    return {
        subscribe: store.subscribe,
        validate,
        reset
    };
} 