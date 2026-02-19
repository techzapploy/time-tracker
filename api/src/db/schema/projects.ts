import { pgTable, uuid, varchar, timestamp, text, boolean, numeric } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';
import { clients } from './clients.js';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: uuid('client_id')
    .references(() => clients.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }).default('#3B82F6'),
  isPublic: boolean('is_public').default(true).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
