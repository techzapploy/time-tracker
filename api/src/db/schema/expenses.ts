import { pgTable, uuid, varchar, timestamp, text, numeric, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';
import { users } from './users.js';
import { projects } from './projects.js';

export const expenseStatusEnum = pgEnum('expense_status', [
  'draft',
  'submitted',
  'approved',
  'rejected',
]);

export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'set null' }),
  category: varchar('category', { length: 100 }),
  description: text('description'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  expenseDate: timestamp('expense_date').notNull(),
  isBillable: boolean('is_billable').default(false).notNull(),
  status: expenseStatusEnum('status').default('draft').notNull(),
  receiptUrl: text('receipt_url'),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
