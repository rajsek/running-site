import { marathonPlanTemplate, phaseForWeek } from '../data/marathonPlanTemplate';
import type {
  DerivedMarathonWeek,
  DerivedMarathonWorkout,
  ISODate,
  MarathonSummary,
  MarathonWorkoutProgress,
  MarathonWorkoutTemplate,
} from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

const parseIsoDateUtc = (date: ISODate): Date => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const toIsoDate = (date: Date): ISODate => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addDays = (date: ISODate, days: number): ISODate =>
  toIsoDate(new Date(parseIsoDateUtc(date).getTime() + days * DAY_MS));

export const formatWeekday = (date: ISODate, width: 'short' | 'long' = 'short'): string =>
  new Intl.DateTimeFormat('en-US', { weekday: width, timeZone: 'UTC' }).format(parseIsoDateUtc(date));

export const formatMonthDay = (date: ISODate): string =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(parseIsoDateUtc(date));

export const formatLongDate = (date: ISODate): string =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseIsoDateUtc(date));

const deriveWorkout = (template: MarathonWorkoutTemplate, startDate: ISODate): DerivedMarathonWorkout => {
  const date = addDays(startDate, template.dayOffset);
  return {
    ...template,
    date,
    weekdayShort: formatWeekday(date, 'short'),
    weekdayLong: formatWeekday(date, 'long'),
    monthDayLabel: formatMonthDay(date),
  };
};

export const deriveMarathonWorkouts = (
  startDate: ISODate,
  template: MarathonWorkoutTemplate[] = marathonPlanTemplate,
): DerivedMarathonWorkout[] => template.map((workout) => deriveWorkout(workout, startDate));

export const deriveMarathonWeeks = (
  startDate: ISODate,
  template: MarathonWorkoutTemplate[] = marathonPlanTemplate,
  phaseResolver: (weekIndex: number) => DerivedMarathonWeek['phase'] = phaseForWeek,
): DerivedMarathonWeek[] => {
  const workouts = deriveMarathonWorkouts(startDate, template);
  const weekIndexes = Array.from(new Set(workouts.map((workout) => workout.weekIndex))).sort((a, b) => a - b);

  return weekIndexes.map((weekIndex) => {
    const weekWorkouts = workouts.filter((workout) => workout.weekIndex === weekIndex);
    const startDate = weekWorkouts[0].date;
    const endDate = weekWorkouts[weekWorkouts.length - 1].date;
    return {
      weekIndex,
      phase: phaseResolver(weekIndex),
      startDate,
      endDate,
      rangeLabel: `${formatMonthDay(startDate)} - ${formatMonthDay(endDate)}`,
      workouts: weekWorkouts,
    };
  });
};

export const getRaceWorkout = (weeks: DerivedMarathonWeek[]): DerivedMarathonWorkout | undefined =>
  weeks.flatMap((week) => week.workouts).find((workout) => workout.kind === 'race');

export const getNextWorkout = (
  workouts: DerivedMarathonWorkout[],
  progressByWorkoutId: Record<string, MarathonWorkoutProgress>,
): DerivedMarathonWorkout | undefined =>
  workouts.find((workout) => !progressByWorkoutId[workout.id]?.completed && workout.kind !== 'rest');

export const summarizeMarathon = (
  weeks: DerivedMarathonWeek[],
  progressByWorkoutId: Record<string, MarathonWorkoutProgress>,
): MarathonSummary => {
  const workouts = weeks.flatMap((week) => week.workouts);
  const nonRestWorkouts = workouts.filter((workout) => workout.kind !== 'rest');
  const completedWorkouts = workouts.filter((workout) => progressByWorkoutId[workout.id]?.completed).length;
  const completedRuns = nonRestWorkouts.filter((workout) => progressByWorkoutId[workout.id]?.completed).length;
  const flaggedWorkouts = workouts.filter((workout) => {
    const signal = progressByWorkoutId[workout.id]?.recoverySignal;
    return signal && signal !== 'ok';
  }).length;

  return {
    totalWorkouts: workouts.length,
    completedWorkouts,
    totalRuns: nonRestWorkouts.length,
    completedRuns,
    flaggedWorkouts,
    nextWorkout: getNextWorkout(workouts, progressByWorkoutId),
    raceWorkout: getRaceWorkout(weeks),
  };
};

export const summarizeWeekCompletion = (
  week: DerivedMarathonWeek,
  progressByWorkoutId: Record<string, MarathonWorkoutProgress>,
): { completed: number; total: number; flagged: number } => {
  const total = week.workouts.length;
  const completed = week.workouts.filter((workout) => progressByWorkoutId[workout.id]?.completed).length;
  const flagged = week.workouts.filter((workout) => {
    const signal = progressByWorkoutId[workout.id]?.recoverySignal;
    return signal && signal !== 'ok';
  }).length;
  return { completed, total, flagged };
};

export const formatDistance = (workout: Pick<DerivedMarathonWorkout, 'plannedDistanceKm' | 'plannedDistanceRangeKm'>): string => {
  if (workout.plannedDistanceRangeKm) return `${workout.plannedDistanceRangeKm[0]}-${workout.plannedDistanceRangeKm[1]} km`;
  if (workout.plannedDistanceKm !== undefined) return `${workout.plannedDistanceKm} km`;
  return '';
};
