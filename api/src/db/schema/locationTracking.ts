import { pgTable, uuid, timestamp, numeric, varchar } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';
import { users } from './users.js';
import { timeEntries } from './timeEntries.js';

export const locationTracking = pgTable('location_tracking', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  timeEntryId: uuid('time_entry_id')
    .references(() => timeEntries.id, { onDelete: 'cascade' }),
  latitude: numeric('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: numeric('longitude', { precision: 11, scale: 8 }).notNull(),
  accuracy: numeric('accuracy', { precision: 10, scale: 2 }),
  address: varchar('address', { length: 500 }),
  trackedAt: timestamp('tracked_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type LocationTracking = typeof locationTracking.$inferSelect;
export type NewLocationTracking = typeof locationTracking.$inferInsert;
