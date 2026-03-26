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
	type: text('type').$type<ScheduleType>(),
	day: text('day').notNull(),
	subject: text('subject').notNull(),
	class: text('class').notNull(),
	teacherPrefix: text('teacher_prefix'),
	teacher: text('teacher').notNull(),
	period: integer('period').notNull(),
	order: integer('order').notNull()
});

export * from './auth.schema';
