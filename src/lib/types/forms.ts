import type { BaseDocument, LLMContext } from '$lib/server/mongodb/types';
import type { ObjectId } from 'mongodb';

// Base interface for all entities
export interface EntityWithCommon extends Omit<Partial<BaseDocument>, '_id'> {
    _id?: ObjectId | string;
    name: string;
    description: string;
    isPublic?: boolean;
    llmContext: LLMContext;
    [key: string]: any;
}

// Type for validation state
export interface ValidationState {
    errors: ValidationError[];
    isValid: boolean;
    getFieldError: (path: string) => string | undefined;
}

// Type for validation errors
export interface ValidationError {
    path: (string | number)[];
    message: string;
}

// Type for form field options
export interface FormFieldOptions {
    type?: 'text' | 'textarea' | 'number' | 'url';
    placeholder?: string;
    label?: string;
    required?: boolean;
}

// Type for entity form props
export interface EntityFormProps<T extends EntityWithCommon> {
    entity: T;
    entityType: 'universe' | 'character' | 'plot' | 'location' | 'event';
    onSubmit: (data: T) => void | Promise<void>;
    onCancel: () => void;
    validation?: ValidationState;
} 