import { pgTable, uuid, timestamp, text } from 'drizzle-orm/pg-core';
import { customFields } from './customFields.js';
import { timeEntries } from './timeEntries.js';

export const customFieldValues = pgTable('custom_field_values', {
  id: uuid('id').defaultRandom().primaryKey(),
  fieldId: uuid('field_id')
    .references(() => customFields.id, { onDelete: 'cascade' })
    .notNull(),
  timeEntryId: uuid('time_entry_id')
    .references(() => timeEntries.id, { onDelete: 'cascade' })
    .notNull(),
  value: text('value'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type CustomFieldValue = typeof customFieldValues.$inferSelect;
export type NewCustomFieldValue = typeof customFieldValues.$inferInsert;
