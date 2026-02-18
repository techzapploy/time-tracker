import { pgTable, uuid, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';
import { users } from './users.js';
import { timeEntries } from './timeEntries.js';

export const activityTracking = pgTable('activity_tracking', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  timeEntryId: uuid('time_entry_id')
    .references(() => timeEntries.id, { onDelete: 'cascade' }),
  appName: varchar('app_name', { length: 255 }),
  windowTitle: text('window_title'),
  url: text('url'),
  category: varchar('category', { length: 50 }),
  durationSeconds: integer('duration_seconds').notNull(),
  trackedAt: timestamp('tracked_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ActivityTracking = typeof activityTracking.$inferSelect;
export type NewActivityTracking = typeof activityTracking.$inferInsert;
