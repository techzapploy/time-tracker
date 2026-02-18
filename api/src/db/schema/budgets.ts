import { pgTable, uuid, varchar, timestamp, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';
import { projects } from './projects.js';

export const budgetTypeEnum = pgEnum('budget_type', [
  'total',
  'weekly',
  'monthly',
]);

export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  budgetType: budgetTypeEnum('budget_type').default('total').notNull(),
  budgetHours: integer('budget_hours'),
  budgetAmount: numeric('budget_amount', { precision: 12, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  alertThreshold: integer('alert_threshold').default(80),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
