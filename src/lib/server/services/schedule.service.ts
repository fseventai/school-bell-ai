import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { schedule } from '$lib/server/db/schema';
import { z } from 'zod';

// Input Validation via Zod
export const scheduleSchema = z.object({
	time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
	timestart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
	timeend: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
	type: z.enum(['Lesson', 'Change', 'Break', 'Prayer', 'EndSchool', 'StartSchool']).optional().nullable(),
	day: z.string().min(1, 'Day is required'),
	subject: z.string().min(1, 'Subject is required'),
	class: z.string().min(1, 'Class is required'),
	teacherPrefix: z.string().optional().nullable(),
	teacher: z.string().min(1, 'Teacher is required'),
	period: z.number().int().min(1, 'Period is required'),
	order: z.number().int().min(1, 'Order is required')
});

export type InsertSchedule = z.infer<typeof scheduleSchema>;
export type UpdateSchedule = Partial<InsertSchedule>;

export const scheduleService = {
	async getAll() {
		try {
			return await db.select().from(schedule);
		} catch (error) {
			console.error('Failed to get schedules:', error);
			throw new Error('Database error occurred while fetching schedules', { cause: error });
		}
	},

	async getById(id: string) {
		if (!id) throw new Error('Schedule ID is required');

		try {
			const result = await db.select().from(schedule).where(eq(schedule.id, id)).limit(1);
			return result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error(`Failed to get schedule ${id}:`, error);
			throw new Error('Database error occurred while fetching schedule', { cause: error });
		}
	},

	async create(data: unknown) {
		// Server-side input validation
		const validated = scheduleSchema.safeParse(data);
		if (!validated.success) {
			throw new Error(validated.error.issues[0].message);
		}

		try {
			const result = await db
				.insert(schedule)
				.values({
					time: validated.data.time,
					timestart: validated.data.timestart,
					timeend: validated.data.timeend,
					type: validated.data.type ?? null,
					day: validated.data.day,
					subject: validated.data.subject,
					class: validated.data.class,
					teacherPrefix: validated.data.teacherPrefix ?? null,
					teacher: validated.data.teacher,
					period: validated.data.period,
					order: validated.data.order
				})
				.returning();
			return result[0];
		} catch (error) {
			console.error('Failed to create schedule:', error);
			throw new Error('Database error occurred while creating schedule', { cause: error });
		}
	},

	async update(id: string, data: unknown) {
		if (!id) throw new Error('Schedule ID is required for update');

		// Partial validation for updates
		const validated = scheduleSchema.partial().safeParse(data);
		if (!validated.success) {
			throw new Error(validated.error.issues[0].message);
		}

		try {
			const result = await db
				.update(schedule)
				.set({
					...validated.data
				})
				.where(eq(schedule.id, id))
				.returning();

			return result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error(`Failed to update schedule ${id}:`, error);
			throw new Error('Database error occurred while updating schedule', { cause: error });
		}
	},

	async delete(id: string) {
		if (!id) throw new Error('Schedule ID is required for deletion');

		try {
			const result = await db.delete(schedule).where(eq(schedule.id, id)).returning();
			return result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error(`Failed to delete schedule ${id}:`, error);
			throw new Error('Database error occurred while deleting schedule', { cause: error });
		}
	}
};
