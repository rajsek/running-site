import type { MarathonWorkoutTemplate, PaceZone, WeekPhase } from '../types';

export const DEFAULT_MARATHON_START_DATE = '2026-05-12';

export const paceZones: PaceZone[] = [
  { id: 'easy', label: 'Easy / Recovery', pace: '7:35-8:10 / km' },
  { id: 'long', label: 'Long Run', pace: '7:30-8:15 / km' },
  { id: 'steady', label: 'Steady', pace: '6:55-7:15 / km' },
  { id: 'tempo', label: 'Tempo', pace: '6:30-6:45 / km' },
  { id: 'intervals', label: 'Intervals', pace: '5:55-6:20 / km' },
  { id: 'walk', label: 'Walk Break', pace: '1-2 min every 20-30 min if needed' },
];

const workout = (item: MarathonWorkoutTemplate): MarathonWorkoutTemplate => item;

export const marathonPlanTemplate: MarathonWorkoutTemplate[] = [
  workout({ id: 'w01-d01', weekIndex: 1, dayOffset: 0, title: '4 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 4, paceZoneId: 'easy' }),
  workout({ id: 'w01-d02', weekIndex: 1, dayOffset: 1, title: 'Strength training + 30 min walk', kind: 'strength', intensity: 'recovery', durationMinutes: 30, note: 'Glutes, calves, core, hips.' }),
  workout({ id: 'w01-d03', weekIndex: 1, dayOffset: 2, title: '5 km easy with last 1 km steady', kind: 'run', intensity: 'easy', plannedDistanceKm: 5, paceZoneId: 'easy' }),
  workout({ id: 'w01-d04', weekIndex: 1, dayOffset: 3, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w01-d05', weekIndex: 1, dayOffset: 4, title: '8 km long easy run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 8, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w01-d06', weekIndex: 1, dayOffset: 5, title: '40 min cycling or brisk walk', kind: 'cross-training', intensity: 'recovery', durationMinutes: 40 }),
  workout({ id: 'w01-d07', weekIndex: 1, dayOffset: 6, title: 'Rest + mobility', kind: 'mobility', intensity: 'rest' }),

  workout({ id: 'w02-d01', weekIndex: 2, dayOffset: 7, title: '5 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 5, paceZoneId: 'easy' }),
  workout({ id: 'w02-d02', weekIndex: 2, dayOffset: 8, title: 'Strength + mobility', kind: 'strength', intensity: 'recovery' }),
  workout({ id: 'w02-d03', weekIndex: 2, dayOffset: 9, title: '5 km with 3 x 3 min tempo', kind: 'run', intensity: 'tempo', plannedDistanceKm: 5, paceZoneId: 'tempo' }),
  workout({ id: 'w02-d04', weekIndex: 2, dayOffset: 10, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w02-d05', weekIndex: 2, dayOffset: 11, title: '10 km long run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 10, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w02-d06', weekIndex: 2, dayOffset: 12, title: 'Recovery walk 4-5 km', kind: 'cross-training', intensity: 'recovery', plannedDistanceRangeKm: [4, 5] }),
  workout({ id: 'w02-d07', weekIndex: 2, dayOffset: 13, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w03-d01', weekIndex: 3, dayOffset: 14, title: '6 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 6, paceZoneId: 'easy' }),
  workout({ id: 'w03-d02', weekIndex: 3, dayOffset: 15, title: 'Cross-training cycling or swim', kind: 'cross-training', intensity: 'recovery' }),
  workout({ id: 'w03-d03', weekIndex: 3, dayOffset: 16, title: '6 km steady', kind: 'run', intensity: 'steady', plannedDistanceKm: 6, paceZoneId: 'steady' }),
  workout({ id: 'w03-d04', weekIndex: 3, dayOffset: 17, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w03-d05', weekIndex: 3, dayOffset: 18, title: '12 km long run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 12, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w03-d06', weekIndex: 3, dayOffset: 19, title: 'Mobility + stretching', kind: 'mobility', intensity: 'recovery' }),
  workout({ id: 'w03-d07', weekIndex: 3, dayOffset: 20, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w04-d01', weekIndex: 4, dayOffset: 21, title: '4 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 4, paceZoneId: 'easy' }),
  workout({ id: 'w04-d02', weekIndex: 4, dayOffset: 22, title: 'Strength training', kind: 'strength', intensity: 'recovery' }),
  workout({ id: 'w04-d03', weekIndex: 4, dayOffset: 23, title: '5 km relaxed', kind: 'run', intensity: 'easy', plannedDistanceKm: 5, paceZoneId: 'easy' }),
  workout({ id: 'w04-d04', weekIndex: 4, dayOffset: 24, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w04-d05', weekIndex: 4, dayOffset: 25, title: '8 km easy long run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 8, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w04-d06', weekIndex: 4, dayOffset: 26, title: 'Walk + stretching', kind: 'mobility', intensity: 'recovery' }),
  workout({ id: 'w04-d07', weekIndex: 4, dayOffset: 27, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w05-d01', weekIndex: 5, dayOffset: 28, title: '6 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 6, paceZoneId: 'easy' }),
  workout({ id: 'w05-d02', weekIndex: 5, dayOffset: 29, title: 'Strength + mobility', kind: 'strength', intensity: 'recovery' }),
  workout({ id: 'w05-d03', weekIndex: 5, dayOffset: 30, title: '7 km with 4 x 4 min tempo', kind: 'run', intensity: 'tempo', plannedDistanceKm: 7, paceZoneId: 'tempo' }),
  workout({ id: 'w05-d04', weekIndex: 5, dayOffset: 31, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w05-d05', weekIndex: 5, dayOffset: 32, title: '14 km long run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 14, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w05-d06', weekIndex: 5, dayOffset: 33, title: 'Recovery walk/cycle', kind: 'cross-training', intensity: 'recovery' }),
  workout({ id: 'w05-d07', weekIndex: 5, dayOffset: 34, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w06-d01', weekIndex: 6, dayOffset: 35, title: '7 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 7, paceZoneId: 'easy' }),
  workout({ id: 'w06-d02', weekIndex: 6, dayOffset: 36, title: 'Cross-training', kind: 'cross-training', intensity: 'recovery' }),
  workout({ id: 'w06-d03', weekIndex: 6, dayOffset: 37, title: '7 km steady', kind: 'run', intensity: 'steady', plannedDistanceKm: 7, paceZoneId: 'steady' }),
  workout({ id: 'w06-d04', weekIndex: 6, dayOffset: 38, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w06-d05', weekIndex: 6, dayOffset: 39, title: '16 km long run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 16, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w06-d06', weekIndex: 6, dayOffset: 40, title: 'Mobility work', kind: 'mobility', intensity: 'recovery' }),
  workout({ id: 'w06-d07', weekIndex: 6, dayOffset: 41, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w07-d01', weekIndex: 7, dayOffset: 42, title: '7 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 7, paceZoneId: 'easy' }),
  workout({ id: 'w07-d02', weekIndex: 7, dayOffset: 43, title: 'Strength training', kind: 'strength', intensity: 'recovery' }),
  workout({ id: 'w07-d03', weekIndex: 7, dayOffset: 44, title: '8 km with intervals 5 x 800 m', kind: 'run', intensity: 'intervals', plannedDistanceKm: 8, paceZoneId: 'intervals' }),
  workout({ id: 'w07-d04', weekIndex: 7, dayOffset: 45, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w07-d05', weekIndex: 7, dayOffset: 46, title: '18 km long run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 18, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w07-d06', weekIndex: 7, dayOffset: 47, title: 'Recovery walk', kind: 'cross-training', intensity: 'recovery' }),
  workout({ id: 'w07-d07', weekIndex: 7, dayOffset: 48, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w08-d01', weekIndex: 8, dayOffset: 49, title: '5 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 5, paceZoneId: 'easy' }),
  workout({ id: 'w08-d02', weekIndex: 8, dayOffset: 50, title: 'Mobility + cycling', kind: 'cross-training', intensity: 'recovery' }),
  workout({ id: 'w08-d03', weekIndex: 8, dayOffset: 51, title: '6 km relaxed', kind: 'run', intensity: 'easy', plannedDistanceKm: 6, paceZoneId: 'easy' }),
  workout({ id: 'w08-d04', weekIndex: 8, dayOffset: 52, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w08-d05', weekIndex: 8, dayOffset: 53, title: '12 km long run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 12, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w08-d06', weekIndex: 8, dayOffset: 54, title: 'Yoga/stretching', kind: 'mobility', intensity: 'recovery' }),
  workout({ id: 'w08-d07', weekIndex: 8, dayOffset: 55, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w09-d01', weekIndex: 9, dayOffset: 56, title: '8 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 8, paceZoneId: 'easy' }),
  workout({ id: 'w09-d02', weekIndex: 9, dayOffset: 57, title: 'Strength training', kind: 'strength', intensity: 'recovery' }),
  workout({ id: 'w09-d03', weekIndex: 9, dayOffset: 58, title: '8 km tempo blocks', kind: 'run', intensity: 'tempo', plannedDistanceKm: 8, paceZoneId: 'tempo' }),
  workout({ id: 'w09-d04', weekIndex: 9, dayOffset: 59, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w09-d05', weekIndex: 9, dayOffset: 60, title: '20 km long run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 20, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w09-d06', weekIndex: 9, dayOffset: 61, title: 'Recovery walk', kind: 'cross-training', intensity: 'recovery' }),
  workout({ id: 'w09-d07', weekIndex: 9, dayOffset: 62, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w10-d01', weekIndex: 10, dayOffset: 63, title: '8 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 8, paceZoneId: 'easy' }),
  workout({ id: 'w10-d02', weekIndex: 10, dayOffset: 64, title: 'Cross-training', kind: 'cross-training', intensity: 'recovery' }),
  workout({ id: 'w10-d03', weekIndex: 10, dayOffset: 65, title: '9 km steady', kind: 'run', intensity: 'steady', plannedDistanceKm: 9, paceZoneId: 'steady' }),
  workout({ id: 'w10-d04', weekIndex: 10, dayOffset: 66, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w10-d05', weekIndex: 10, dayOffset: 67, title: '22 km long run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 22, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w10-d06', weekIndex: 10, dayOffset: 68, title: 'Stretching + foam roll', kind: 'mobility', intensity: 'recovery' }),
  workout({ id: 'w10-d07', weekIndex: 10, dayOffset: 69, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w11-d01', weekIndex: 11, dayOffset: 70, title: '8 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 8, paceZoneId: 'easy' }),
  workout({ id: 'w11-d02', weekIndex: 11, dayOffset: 71, title: 'Strength training', kind: 'strength', intensity: 'recovery' }),
  workout({ id: 'w11-d03', weekIndex: 11, dayOffset: 72, title: '9 km intervals', kind: 'run', intensity: 'intervals', plannedDistanceKm: 9, paceZoneId: 'intervals' }),
  workout({ id: 'w11-d04', weekIndex: 11, dayOffset: 73, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w11-d05', weekIndex: 11, dayOffset: 74, title: '24 km long run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 24, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w11-d06', weekIndex: 11, dayOffset: 75, title: 'Recovery walk', kind: 'cross-training', intensity: 'recovery' }),
  workout({ id: 'w11-d07', weekIndex: 11, dayOffset: 76, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w12-d01', weekIndex: 12, dayOffset: 77, title: '6 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 6, paceZoneId: 'easy' }),
  workout({ id: 'w12-d02', weekIndex: 12, dayOffset: 78, title: 'Mobility work', kind: 'mobility', intensity: 'recovery' }),
  workout({ id: 'w12-d03', weekIndex: 12, dayOffset: 79, title: '7 km relaxed', kind: 'run', intensity: 'easy', plannedDistanceKm: 7, paceZoneId: 'easy' }),
  workout({ id: 'w12-d04', weekIndex: 12, dayOffset: 80, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w12-d05', weekIndex: 12, dayOffset: 81, title: '16 km long run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 16, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w12-d06', weekIndex: 12, dayOffset: 82, title: 'Yoga or walking', kind: 'mobility', intensity: 'recovery' }),
  workout({ id: 'w12-d07', weekIndex: 12, dayOffset: 83, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w13-d01', weekIndex: 13, dayOffset: 84, title: '9 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 9, paceZoneId: 'easy' }),
  workout({ id: 'w13-d02', weekIndex: 13, dayOffset: 85, title: 'Strength training', kind: 'strength', intensity: 'recovery' }),
  workout({ id: 'w13-d03', weekIndex: 13, dayOffset: 86, title: '10 km marathon pace practice', kind: 'run', intensity: 'steady', plannedDistanceKm: 10, paceZoneId: 'steady' }),
  workout({ id: 'w13-d04', weekIndex: 13, dayOffset: 87, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w13-d05', weekIndex: 13, dayOffset: 88, title: '28 km long run', kind: 'long-run', intensity: 'long', plannedDistanceKm: 28, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w13-d06', weekIndex: 13, dayOffset: 89, title: 'Recovery walk', kind: 'cross-training', intensity: 'recovery' }),
  workout({ id: 'w13-d07', weekIndex: 13, dayOffset: 90, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w14-d01', weekIndex: 14, dayOffset: 91, title: '8 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 8, paceZoneId: 'easy' }),
  workout({ id: 'w14-d02', weekIndex: 14, dayOffset: 92, title: 'Mobility + core', kind: 'mobility', intensity: 'recovery' }),
  workout({ id: 'w14-d03', weekIndex: 14, dayOffset: 93, title: '10 km steady', kind: 'run', intensity: 'steady', plannedDistanceKm: 10, paceZoneId: 'steady' }),
  workout({ id: 'w14-d04', weekIndex: 14, dayOffset: 94, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w14-d05', weekIndex: 14, dayOffset: 95, title: '30-32 km long run', kind: 'long-run', intensity: 'long', plannedDistanceRangeKm: [30, 32], paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w14-d06', weekIndex: 14, dayOffset: 96, title: 'Full recovery', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w14-d07', weekIndex: 14, dayOffset: 97, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w15-d01', weekIndex: 15, dayOffset: 98, title: '6 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 6, paceZoneId: 'easy' }),
  workout({ id: 'w15-d02', weekIndex: 15, dayOffset: 99, title: 'Light mobility', kind: 'mobility', intensity: 'recovery' }),
  workout({ id: 'w15-d03', weekIndex: 15, dayOffset: 100, title: '5 km with short pickups', kind: 'run', intensity: 'tempo', plannedDistanceKm: 5, paceZoneId: 'tempo' }),
  workout({ id: 'w15-d04', weekIndex: 15, dayOffset: 101, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w15-d05', weekIndex: 15, dayOffset: 102, title: '14 km easy', kind: 'long-run', intensity: 'long', plannedDistanceKm: 14, paceZoneId: 'long', isLongRun: true }),
  workout({ id: 'w15-d06', weekIndex: 15, dayOffset: 103, title: 'Recovery walk', kind: 'cross-training', intensity: 'recovery' }),
  workout({ id: 'w15-d07', weekIndex: 15, dayOffset: 104, title: 'Rest', kind: 'rest', intensity: 'rest' }),

  workout({ id: 'w16-d01', weekIndex: 16, dayOffset: 105, title: '5 km easy', kind: 'run', intensity: 'easy', plannedDistanceKm: 5, paceZoneId: 'easy' }),
  workout({ id: 'w16-d02', weekIndex: 16, dayOffset: 106, title: '4 km relaxed', kind: 'run', intensity: 'easy', plannedDistanceKm: 4, paceZoneId: 'easy' }),
  workout({ id: 'w16-d03', weekIndex: 16, dayOffset: 107, title: 'Rest', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w16-d04', weekIndex: 16, dayOffset: 108, title: '3 km shakeout', kind: 'run', intensity: 'easy', plannedDistanceKm: 3, paceZoneId: 'easy' }),
  workout({ id: 'w16-d05', weekIndex: 16, dayOffset: 109, title: 'Full rest + hydration', kind: 'rest', intensity: 'rest' }),
  workout({ id: 'w16-d06', weekIndex: 16, dayOffset: 110, title: 'Marathon Day', kind: 'race', intensity: 'race', plannedDistanceKm: 42.2, paceZoneId: 'long' }),
];

export const phaseForWeek = (weekIndex: number): WeekPhase => {
  if (weekIndex === 16) return 'race';
  if (weekIndex === 15) return 'taper';
  if (weekIndex === 14) return 'peak';
  if ([4, 8, 12].includes(weekIndex)) return 'recovery';
  if (weekIndex >= 9) return 'build';
  return 'base';
};
