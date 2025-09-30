import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  date,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  keycloakUserId: varchar('keycloak_user_id', { length: 255 })
    .unique()
    .notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: date('date_of_birth'),
  address: text('address'),
  bio: text('bio'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => userProfiles.id),
  theme: varchar('theme', { length: 50 }).default('light'),
  language: varchar('language', { length: 10 }).default('en'),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type UserPreference = typeof userPreferences.$inferSelect;
