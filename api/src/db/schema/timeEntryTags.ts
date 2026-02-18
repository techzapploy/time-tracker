import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { timeEntries } from './timeEntries.js';
import { tags } from './tags.js';

export const timeEntryTags = pgTable('time_entry_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  timeEntryId: uuid('time_entry_id')
    .references(() => timeEntries.id, { onDelete: 'cascade' })
    .notNull(),
  tagId: uuid('tag_id')
    .references(() => tags.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type TimeEntryTag = typeof timeEntryTags.$inferSelect;
export type NewTimeEntryTag = typeof timeEntryTags.$inferInsert;
