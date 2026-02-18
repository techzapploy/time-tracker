import { pgTable, uuid, varchar, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';

export const timeOffPolicies = pgTable('time_off_policies', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  accrualRateHours: integer('accrual_rate_hours'),
  maxBalanceHours: integer('max_balance_hours'),
  isPaid: boolean('is_paid').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type TimeOffPolicy = typeof timeOffPolicies.$inferSelect;
export type NewTimeOffPolicy = typeof timeOffPolicies.$inferInsert;
