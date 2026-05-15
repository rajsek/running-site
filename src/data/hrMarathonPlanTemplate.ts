import type { MarathonWorkoutTemplate, WeekPhase } from '../types';

export const DEFAULT_HR_MARATHON_START_DATE = '2026-04-27';

type HrWorkoutInput = Omit<MarathonWorkoutTemplate, 'id' | 'weekIndex' | 'dayOffset'>;

const hrWorkout = (
  weekIndex: number,
  dayIndex: number,
  item: HrWorkoutInput,
): MarathonWorkoutTemplate => ({
  ...item,
  id: `hr-w${String(weekIndex).padStart(2, '0')}-d${dayIndex}`,
  weekIndex,
  dayOffset: (weekIndex - 1) * 7 + dayIndex - 1,
});

const hrWeek = (weekIndex: number, days: HrWorkoutInput[]): MarathonWorkoutTemplate[] =>
  days.map((day, index) => hrWorkout(weekIndex, index + 1, day));

const rest = (title = 'Rest'): HrWorkoutInput => ({ title, kind: 'rest', intensity: 'rest' });
const strength = (title = 'Strength / Cross-Train'): HrWorkoutInput => ({ title, kind: 'strength', intensity: 'recovery' });
const easy = (title: string, km?: number): HrWorkoutInput => ({ title, kind: 'run', intensity: 'easy', plannedDistanceKm: km, paceZoneId: 'easy' });
const intervals = (title: string, km?: number): HrWorkoutInput => ({ title, kind: 'run', intensity: 'intervals', plannedDistanceKm: km, paceZoneId: 'intervals' });
const tempo = (title: string, km?: number): HrWorkoutInput => ({ title, kind: 'run', intensity: 'tempo', plannedDistanceKm: km, paceZoneId: 'tempo' });
const steady = (title: string, km?: number): HrWorkoutInput => ({ title, kind: 'run', intensity: 'steady', plannedDistanceKm: km, paceZoneId: 'steady' });
const long = (title: string, km?: number): HrWorkoutInput => ({ title, kind: 'long-run', intensity: 'long', plannedDistanceKm: km, paceZoneId: 'long', isLongRun: true });
const race = (title: string): HrWorkoutInput => ({ title, kind: 'race', intensity: 'race', plannedDistanceKm: 42.2, paceZoneId: 'long' });

export const hrMarathonPlanTemplate: MarathonWorkoutTemplate[] = [
  ...hrWeek(1, [
    rest(),
    intervals('4 km total: 3 km Easy + 4 x 60 m Strides', 4),
    strength(),
    easy('5 km Easy', 5),
    rest(),
    rest(),
    long('6 km Long Slow Distance', 6),
  ]),
  ...hrWeek(2, [
    rest(),
    intervals('4 km total: 2 km Easy + 4 x 200 m Intervals + 1 km Easy', 4),
    strength(),
    tempo('6 km total: 3 km Easy + 4 x 60 s Hills + 2 km Easy', 6),
    rest(),
    rest(),
    long('7 km Long Slow Distance', 7),
  ]),
  ...hrWeek(3, [
    rest(),
    intervals('5 km Fartlek: 2 km Easy + 6 x 1 min Strong / 1 min Easy + 1 km Easy', 5),
    strength(),
    steady('6 km Easy Steady', 6),
    rest(),
    rest(),
    long('6 km Long Slow Distance - Cutback', 6),
  ]),
  ...hrWeek(4, [
    rest(),
    intervals('5 km total: 3 km Easy + 4 x 300 m Intervals + 1 km Easy', 5),
    strength(),
    tempo('7 km total: 3 km Easy + 3 km Tempo + 2 km Easy OR 4 x 75 s Hills', 7),
    rest(),
    rest(),
    long('8 km Long Slow Distance', 8),
  ]),
  ...hrWeek(5, [
    rest(),
    intervals('5 km total: 2 km Easy + 5 x 200 m Intervals + 2 km Easy', 5),
    strength(),
    steady('7 km total: 3 km Easy + 3 km Marathon Pace + 2 km Easy', 7),
    rest(),
    rest(),
    long('9 km Long Slow Distance', 9),
  ]),
  ...hrWeek(6, [
    rest(),
    intervals('6 km total: 3 km Easy + 6 x 100 m Strides + 2 km Easy', 6),
    strength(),
    tempo('8 km total: 3 km Easy + 4 x 90 s Hills + 2 km Easy', 8),
    rest(),
    rest(),
    long('8 km Long Slow Distance - Cutback', 8),
  ]),
  ...hrWeek(7, [
    rest(),
    intervals('6 km total: 3 km Easy + 4 x 400 m Intervals + 2 km Easy', 6),
    strength(),
    steady('8 km total: 3 km Easy + 4 km Marathon Pace + 2 km Easy', 8),
    rest(),
    rest(),
    long('11 km Long Slow Distance', 11),
  ]),
  ...hrWeek(8, [
    rest(),
    intervals('6 km Fartlek: 3 km Easy + 8 x 1 min Strong / 1 min Easy + 2 km Easy', 6),
    strength(),
    tempo('9 km total: 4 km Easy + 5 x 75 s Hills + 2 km Easy', 9),
    rest(),
    rest(),
    long('12 km Long Slow Distance', 12),
  ]),
  ...hrWeek(9, [
    rest(),
    intervals('6 km total: 3 km Easy + 5 x 400 m Intervals + 2 km Easy', 6),
    strength(),
    tempo('9 km total: 4 km Easy + 4 km Tempo + 2 km Easy', 9),
    rest(),
    rest(),
    long('11 km Long Slow Distance - Cutback', 11),
  ]),
  ...hrWeek(10, [
    rest(),
    intervals('7 km total: 3 km Easy + 4 x 600 m Intervals + 2 km Easy', 7),
    strength(),
    steady('10 km total: 4 km Easy + 5 km Marathon Pace + 2 km Easy OR 6 x 90 s Hills', 10),
    rest(),
    rest(),
    long('14 km Long Slow Distance - Last 3 km Steady', 14),
  ]),
  ...hrWeek(11, [
    rest(),
    intervals('7 km total: 3 km Easy + 5 x 500 m Intervals + 2 km Easy', 7),
    strength(),
    tempo('10 km total: 4 km Easy + 5 km Tempo + 2 km Easy', 10),
    rest(),
    rest(),
    long('15 km Long Slow Distance', 15),
  ]),
  ...hrWeek(12, [
    rest(),
    intervals('7 km Fartlek: 3 km Easy + 6 x 2 min Strong / 2 min Easy + 2 km Easy', 7),
    strength(),
    tempo('10 km total: 4 km Easy + 6 x 90 s Hills + 2 km Easy', 10),
    rest(),
    rest(),
    long('13 km Long Slow Distance - Cutback', 13),
  ]),
  ...hrWeek(13, [
    rest(),
    intervals('7 km total: 3 km Easy + 5 x 600 m Intervals + 2 km Easy', 7),
    strength(),
    steady('11 km total: 4 km Easy + 6 km Marathon Pace + 2 km Easy', 11),
    rest(),
    rest(),
    long('20 km Long Slow Distance - Last 5 km Steady', 20),
  ]),
  ...hrWeek(14, [
    rest(),
    intervals('7 km total: 3 km Easy + 6 x 400 m Intervals + 2 km Easy', 7),
    strength(),
    tempo('11 km total: 4 km Easy + 5 x 2 min Hills + 2 km Easy', 11),
    rest(),
    rest(),
    long('17 km Long Slow Distance - Cutback', 17),
  ]),
  ...hrWeek(15, [
    rest(),
    intervals('8 km total: 3 km Easy + 4 x 800 m Intervals + 2 km Easy', 8),
    strength(),
    steady('12 km total: 4 km Easy + 7 km Marathon Pace + 2 km Easy', 12),
    rest(),
    rest(),
    long('25 km Long Slow Distance - Last 8 km Steady/Marathon Pace', 25),
  ]),
  ...hrWeek(16, [
    rest(),
    intervals('6 km total: 3 km Easy + 6 x 300 m Intervals + 2 km Easy', 6),
    strength(),
    tempo('9 km total: 4 km Easy + 4 x 90 s Hills + 2 km Easy', 9),
    rest(),
    rest(),
    long('18 km Long Slow Distance - Taper', 18),
  ]),
  ...hrWeek(17, [
    rest(),
    intervals('6 km total: 3 km Easy + 5 x 200 m Intervals + 2 km Easy', 6),
    strength(),
    steady('8 km total: 3 km Easy + 4 km Marathon Pace + 2 km Easy', 8),
    rest(),
    rest(),
    long('12 km Steady Long Slow Distance', 12),
  ]),
  ...hrWeek(18, [
    rest(),
    intervals('5 km total: 3 km Easy + 4 x 80 m Strides + 1 km Easy', 5),
    rest(),
    easy('6 km Easy with optional 3 x 30 s Marathon Pace pickups', 6),
    rest(),
    rest(),
    race('42.2 km MARATHON'),
  ]),
];

export const phaseForHrWeek = (weekIndex: number): WeekPhase => {
  if (weekIndex === 18) return 'race';
  if (weekIndex >= 16) return 'taper';
  if (weekIndex >= 13) return 'peak';
  if ([3, 6, 9, 12, 14].includes(weekIndex)) return 'recovery';
  if (weekIndex >= 7) return 'build';
  return 'base';
};
