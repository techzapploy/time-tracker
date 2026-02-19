import { pgTable, uuid, varchar, timestamp, text, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces.js';

export const customFieldTypeEnum = pgEnum('custom_field_type', [
  'text',
  'number',
  'dropdown',
  'link',
  'date',
]);

export const customFields = pgTable('custom_fields', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  fieldType: customFieldTypeEnum('field_type').notNull(),
  options: text('options'),
  isRequired: boolean('is_required').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type CustomField = typeof customFields.$inferSelect;
export type NewCustomField = typeof customFields.$inferInsert;
