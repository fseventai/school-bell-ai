import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { ScheduleType } from '$lib/types';

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const schedule = sqliteTable('schedule', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	time: text('time').notNull(),
	subjectFinished: text('subject_finished').notNull(),
	subjectNext: text('subject_next').notNull(),
	teacherPrefix: text('teacher_prefix'),
	teacherNext: text('teacher_next').notNull(),
	day: text('day').notNull(),
	type: text('type').$type<ScheduleType>()
});

export * from './auth.schema';
