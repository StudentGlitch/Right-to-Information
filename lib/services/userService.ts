/**
 * User service layer
 * Separation of Concerns: User/plan data and persistence
 */

import { userQueries } from '@/lib/mongodb';
import type { Plan } from '@/lib/auth/types';

/**
 * Get user plan from database. Returns 'free' if user not found.
 */
export async function getUserPlan(userId: string): Promise<Plan> {
  const user = await userQueries.findById(userId);
  return user?.plan ?? 'free';
}

/**
 * Ensure user exists in database. Creates with plan 'free' if new.
 */
export async function ensureUser(
  id: string,
  email: string | null,
  name: string | null,
  image: string | null
): Promise<void> {
  await userQueries.upsertUser(id, email, name, image);
}
