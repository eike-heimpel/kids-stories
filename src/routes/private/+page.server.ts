import { fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { Session } from '@supabase/supabase-js';

export const actions = {
    changePassword: async ({ request, locals: { supabase, safeGetSession } }) => {
        const formData = await request.formData();
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return fail(400, {
                error: 'All fields are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return fail(400, {
                error: 'New passwords do not match'
            });
        }

        if (newPassword.length < 6) {
            return fail(400, {
                error: 'Password must be at least 6 characters long'
            });
        }

        try {
            // First verify the current password
            const { user } = await safeGetSession();
            if (!user?.email) {
                return fail(400, {
                    error: 'User email not found'
                });
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            });

            if (signInError) {
                return fail(400, {
                    error: 'Current password is incorrect'
                });
            }

            // Then update to the new password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            return {
                success: true
            };
        } catch (error) {
            console.error('Password update error:', error);
            return fail(500, {
                error: error instanceof Error ? error.message : 'Failed to update password'
            });
        }
    }
} satisfies Actions;
