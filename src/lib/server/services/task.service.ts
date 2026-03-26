import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { task } from '$lib/server/db/schema';
import { z } from 'zod';

export const taskSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255),
	priority: z.number().int().min(1).max(10).default(1)
});

export type InsertTask = z.infer<typeof taskSchema>;
export type UpdateTask = Partial<InsertTask>;

/**
 * Task Service Handles CRUD Operations for tasks
 * Prioritizes Security via Input Validation & Proper Error Handling
 */
export const taskService = {
	async getAll() {
		try {
			// Query tasks
			return await db.select().from(task).orderBy(task.priority);
		} catch (error) {
			console.error('Failed to get tasks:', error);
			throw new Error('Database error occurred while fetching tasks', { cause: error });
		}
	},

	async getById(id: string) {
		if (!id) throw new Error('Task ID is required');

		try {
			const result = await db.select().from(task).where(eq(task.id, id)).limit(1);
			return result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error(`Failed to get task ${id}:`, error);
			throw new Error('Database error occurred while fetching the task', { cause: error });
		}
	},

	async create(data: unknown) {
		// Server-side validation
		const validated = taskSchema.safeParse(data);
		if (!validated.success) {
			throw new Error(validated.error.issues[0].message);
		}

		try {
			const result = await db
				.insert(task)
				.values({
					title: validated.data.title,
					priority: validated.data.priority
				})
				.returning();
			return result[0];
		} catch (error) {
			console.error('Failed to create task:', error);
			throw new Error('Database error occurred while creating task', { cause: error });
		}
	},

	async update(id: string, data: unknown) {
		if (!id) throw new Error('Task ID is required for update');

		// Partial validation for updates
		const validated = taskSchema.partial().safeParse(data);
		if (!validated.success) {
			throw new Error(validated.error.issues[0].message);
		}

		try {
			const result = await db
				.update(task)
				.set({
					...validated.data
				})
				.where(eq(task.id, id))
				.returning();

			return result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error(`Failed to update task ${id}:`, error);
			throw new Error('Database error occurred while updating task', { cause: error });
		}
	},

	async delete(id: string) {
		if (!id) throw new Error('Task ID is required for deletion');

		try {
			const result = await db.delete(task).where(eq(task.id, id)).returning();
			return result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error(`Failed to delete task ${id}:`, error);
			throw new Error('Database error occurred while deleting task', { cause: error });
		}
	}
};
