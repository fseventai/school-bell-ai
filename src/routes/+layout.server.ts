import { scheduleService } from '$lib/server/services/schedule.service';
import { taskService } from '$lib/server/services/task.service';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	try {
		const schedules = await scheduleService.getAll();
		const tasks = await taskService.getAll();

		return {
			schedules,
			tasks
		};
	} catch (error) {
		console.error('Error loading foundation data:', error);
		return {
			schedules: [],
			tasks: [],
			error: 'Gagal memuat data dari database'
		};
	}
};
