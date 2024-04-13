import { z } from 'zod';
import { relations, sql } from 'drizzle-orm';
import {
  text,
  integer,
  sqliteTable,
  primaryKey,
  uniqueIndex,
  index
} from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';

const roles = ['admin', 'student', 'teacher', 'employee'] as const;

const lessonType = [
  'single',
  'recurrent',
  'replacement_origin',
  'replacement',
  'substitution_origin',
  'substitution',
  'trial',
  'canceled'
] as const;

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    lastname: text('lastname').notNull(),
    email: text('email').notNull().unique(),
    role: text('role', { enum: roles }).notNull(),
    birthdate: text('birthdate'),
    phoneNumber: text('phone_number'),
    profilePicture: text('profile_picture'),
    createdAt: integer('created_at').default(sql`(cast (unixepoch () as int))`),
    updatedAt: integer('updated_at').default(sql`(cast (unixepoch () as int))`)
  },
  t => ({
    emailIdx: uniqueIndex('email_idx').on(t.email),
    roleIdx: index('role_idx').on(t.role),
    createdAtIdx: index('created_at_idx').on(t.createdAt),
    updatedAtIdx: index('updated_at_idx').on(t.updatedAt)
  })
);

export const passwords = sqliteTable('passwords', {
  hash: text('hash').notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id)
});

export const instruments = sqliteTable('instruments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at').default(sql`(cast (unixepoch () as int))`),
  updatedAt: integer('updated_at').default(sql`(cast (unixepoch () as int))`)
});

export const classrooms = sqliteTable('classrooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at').default(sql`(cast (unixepoch () as int))`),
  updatedAt: integer('updated_at').default(sql`(cast (unixepoch () as int))`)
});

export const lessons = sqliteTable(
  'lessons',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    studentId: integer('student_id').notNull(),
    teacherId: integer('teacher_id').notNull(),
    reporterId: integer('reporter_id').notNull(),
    instrumentId: integer('instrument_id').notNull(),
    classroomId: integer('classroom_id').notNull(),
    startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
    endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
    type: text('type', { enum: lessonType }),
    originId: integer('origin_id'),
    createdAt: integer('created_at').default(sql`(cast (unixepoch () as int))`),
    updatedAt: integer('updated_at').default(sql`(cast (unixepoch () as int))`)
  },
  t => ({
    typeIdx: index('type_idx').on(t.type),
    startDateIdx: index('start_date_idx').on(t.startDate),
    endDateIdx: index('end_date_idx').on(t.endDate),
    studentIdx: index('student_idx').on(t.studentId),
    teacherIdx: index('teacher_idx').on(t.teacherId),
    reporterIdx: index('reporter_idx').on(t.reporterId),
    instrumentIdx: index('instrument_idx').on(t.instrumentId),
    classroomIdx: index('classroom_idx').on(t.classroomId)
  })
);

export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('text').notNull(),
  lessonId: integer('lesson_id').notNull(),
  reporterId: integer('reporter_id').notNull(),
  createdAt: integer('created_at').default(sql`(cast (unixepoch () as int))`),
  updatedAt: integer('updated_at').default(sql`(cast (unixepoch () as int))`)
});

export const usersRelations = relations(users, ({ one, many }) => ({
  password: one(passwords, {
    fields: [users.id],
    references: [passwords.userId]
  }),
  instruments: many(instrumentsToUsers),
  studentLessons: many(lessons, { relationName: 'student_relation' }),
  teacherLessons: many(lessons, { relationName: 'teacher_relation' }),
  reporterLessons: many(lessons, { relationName: 'reporter_relation' }),
  notes: many(notes)
}));

export const notesRelations = relations(notes, ({ one }) => ({
  reporter: one(users, {
    fields: [notes.reporterId],
    references: [users.id]
  }),
  lesson: one(lessons, {
    fields: [notes.lessonId],
    references: [lessons.id]
  })
}));

export const instrumentsRelations = relations(instruments, ({ many }) => ({
  lessons: many(lessons),
  users: many(instrumentsToUsers),
  classrooms: many(instrumentsToClassrooms)
}));

export const classroomsRelations = relations(classrooms, ({ many }) => ({
  instruments: many(instrumentsToClassrooms),
  lessons: many(lessons)
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  origin: one(lessons, {
    fields: [lessons.originId],
    references: [lessons.id]
  }),
  notes: many(notes),
  classroom: one(classrooms, {
    fields: [lessons.classroomId],
    references: [classrooms.id]
  }),
  instrument: one(instruments, {
    fields: [lessons.instrumentId],
    references: [instruments.id]
  }),
  student: one(users, {
    relationName: 'student_relation',
    fields: [lessons.studentId],
    references: [users.id]
  }),
  teacher: one(users, {
    relationName: 'teacher_relation',
    fields: [lessons.teacherId],
    references: [users.id]
  }),
  reporter: one(users, {
    relationName: 'reporter_relation',
    fields: [lessons.reporterId],
    references: [users.id]
  })
}));

export const instrumentsToUsers = sqliteTable(
  'instruments_to_users',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    instrumentId: integer('instrument_id')
      .notNull()
      .references(() => instruments.id)
  },
  t => ({
    pk: primaryKey({
      columns: [t.userId, t.instrumentId]
    })
  })
);

export const instrumentsToUsersRelations = relations(
  instrumentsToUsers,
  ({ one }) => ({
    user: one(users, {
      fields: [instrumentsToUsers.userId],
      references: [users.id]
    }),
    instrument: one(instruments, {
      fields: [instrumentsToUsers.instrumentId],
      references: [instruments.id]
    })
  })
);

export const instrumentsToClassrooms = sqliteTable(
  'instruments_to_classrooms',
  {
    classroomId: integer('classroom_id')
      .notNull()
      .references(() => classrooms.id),
    instrumentId: integer('instrument_id')
      .notNull()
      .references(() => instruments.id)
  },
  t => ({
    pk: primaryKey({
      columns: [t.classroomId, t.instrumentId]
    })
  })
);

export const instrumentsToClassroomsRelations = relations(
  instrumentsToClassrooms,
  ({ one }) => ({
    classroom: one(classrooms, {
      fields: [instrumentsToClassrooms.classroomId],
      references: [classrooms.id]
    }),
    instrument: one(instruments, {
      fields: [instrumentsToClassrooms.instrumentId],
      references: [instruments.id]
    })
  })
);

export const InsertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof InsertUserSchema>;
