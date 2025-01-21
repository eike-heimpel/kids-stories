import type { BaseDocument, LLMContext } from '$lib/server/mongodb/types';

// Make the interface more lenient by making all fields optional
export interface EntityWithCommon extends Partial<BaseDocument> {
    name?: string;
    title?: string;
    isPublic?: boolean;
    llmContext?: Partial<LLMContext>;
    [key: string]: any; // Allow any additional fields
} 