import { pgTable, uuid, timestamp, text } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';
import { users } from './users.js';
import { timeEntries } from './timeEntries.js';

export const screenshots = pgTable('screenshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  timeEntryId: uuid('time_entry_id')
    .references(() => timeEntries.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  capturedAt: timestamp('captured_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Screenshot = typeof screenshots.$inferSelect;
export type NewScreenshot = typeof screenshots.$inferInsert;
