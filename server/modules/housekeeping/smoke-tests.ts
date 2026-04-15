import assert from 'node:assert/strict';
import { housekeepingRepository } from './db/housekeeping.repository';
import { roomStatusService } from './services/room-status.service';
import { tasksService } from './services/tasks.service';
import { checklistsService } from './services/checklists.service';
import { schedulerService } from './services/scheduler.service';

async function run() {
  await housekeepingRepository.resetMemory();

  const roomStatusList = await housekeepingRepository.listRooms();
  const roomStatusListWorks = Array.isArray(roomStatusList);

  const task = await tasksService.createTask({
    room_id: 1,
    task_type: 'checkout_clean',
    priority: 'normal',
    notes: 'Smoke task',
  } as any);
  const taskCreationWorks = Boolean(task && task.id && task.room_id !== undefined && task.task_type);

  await checklistsService.seedDefaults();
  const checklists = await checklistsService.listChecklists();
  const checkout = checklists.find((item) => item.task_type === 'checkout_clean');
  const stayover = checklists.find((item) => item.task_type === 'stayover_clean');
  const deep = checklists.find((item) => item.task_type === 'deep_clean');
  const turndown = checklists.find((item) => item.task_type === 'turndown');
  const checklistSeedWorks =
    checklists.length === 4 &&
    checkout?.items.length === 15 &&
    stayover?.items.length === 8 &&
    deep?.items.length === 25 &&
    turndown?.items.length === 6;

  await housekeepingRepository.resetMemory();
  await housekeepingRepository.createChecklist({
    name: 'Default',
    task_type: 'checkout_clean',
    items: [],
    is_default: true,
  } as any);
  const room = await housekeepingRepository.updateRoomStatus(1, 'dirty');
  assert.equal(room.status, 'dirty');
  let invalidTransitionRejected = false;
  try {
    await roomStatusService.updateStatus(1, 'inspected' as any);
  } catch {
    invalidTransitionRejected = true;
  }
  const validTransitionAccepted = Boolean(await roomStatusService.updateStatus(1, 'cleaning' as any));
  const statusTransitionValidation = invalidTransitionRejected && validTransitionAccepted;

  const tasks = await Promise.all(
    Array.from({ length: 6 }).map((_, index) =>
      tasksService.createTask({
        room_id: 1,
        task_type: 'stayover_clean',
        priority: 'normal',
        notes: `task-${index + 1}`,
      } as any)
    )
  );
  const assignments = await schedulerService.autoAssign(tasks, [11, 22, 33]);
  const counts = assignments.reduce<Record<string, number>>((acc, item) => {
    acc[String(item.staffId)] = (acc[String(item.staffId)] || 0) + 1;
    return acc;
  }, {});
  const schedulerRoundRobin = counts['11'] === 2 && counts['22'] === 2 && counts['33'] === 2;

  console.log(JSON.stringify({
    roomStatusListWorks,
    taskCreationWorks,
    checklistSeedWorks,
    statusTransitionValidation,
    schedulerRoundRobin,
  }, null, 2));
}

if (require.main === module) {
  run().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

