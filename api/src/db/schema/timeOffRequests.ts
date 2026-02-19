import { pgTable, uuid, timestamp, text, integer, pgEnum } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';
import { users } from './users.js';
import { timeOffPolicies } from './timeOffPolicies.js';

export const timeOffRequestStatusEnum = pgEnum('time_off_request_status', [
  'pending',
  'approved',
  'rejected',
]);

export const timeOffRequests = pgTable('time_off_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  policyId: uuid('policy_id')
    .references(() => timeOffPolicies.id, { onDelete: 'cascade' })
    .notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  hours: integer('hours').notNull(),
  notes: text('notes'),
  status: timeOffRequestStatusEnum('status').default('pending').notNull(),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type TimeOffRequest = typeof timeOffRequests.$inferSelect;
export type NewTimeOffRequest = typeof timeOffRequests.$inferInsert;
