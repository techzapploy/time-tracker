import { pgTable, uuid, varchar, timestamp, text, numeric, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';
import { clients } from './clients.js';
import { projects } from './projects.js';

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'sent',
  'paid',
  'overdue',
  'void',
]);

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: uuid('client_id')
    .references(() => clients.id, { onDelete: 'set null' }),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'set null' }),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull(),
  status: invoiceStatusEnum('status').default('draft').notNull(),
  issueDate: timestamp('issue_date').notNull(),
  dueDate: timestamp('due_date'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  notes: text('notes'),
  isRecurring: boolean('is_recurring').default(false),
  recurringInterval: varchar('recurring_interval', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
