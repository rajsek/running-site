import { DEFAULT_MARATHON_START_DATE } from '../data/marathonPlanTemplate';
import { DEFAULT_HR_MARATHON_START_DATE } from '../data/hrMarathonPlanTemplate';
import type {
  AppTab,
  DsaProblemProgress,
  MarathonWorkoutProgress,
  RecoverySignal,
  SplitRecord,
  TrackerState,
} from '../types';

export const TRACKER_STORAGE_KEY = 'training-dashboard-tracker:v1';

const validTabs: AppTab[] = ['marathon', 'hrMarathon', 'dsa', 'reference', 'settings'];
const validRecoverySignals: RecoverySignal[] = ['ok', 'watch', 'fatigue', 'pain'];

export const createDefaultTrackerState = (): TrackerState => ({
  schemaVersion: 1,
  settings: {
    marathonStartDate: DEFAULT_MARATHON_START_DATE,
    hrMarathonStartDate: DEFAULT_HR_MARATHON_START_DATE,
    activeTab: 'marathon',
    firebaseSyncEnabled: false,
    notificationEnabled: false,
    notificationTime: '07:00',
    notifyMarathon: true,
    notifyDsa: true,
  },
  marathonProgressByWorkoutId: {},
  dsaProgressByProblemId: {},
  sync: {},
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const stringOrUndefined = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const booleanOrUndefined = (value: unknown): boolean | undefined =>
  typeof value === 'boolean' ? value : undefined;

const sanitizeNotificationTime = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : fallback;
};

const sanitizeSplits = (value: unknown): SplitRecord[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter(isRecord)
    .map((split) => ({
      distance: stringOrUndefined(split.distance) ?? '',
      pace: stringOrUndefined(split.pace) ?? '',
    }));
};

const sanitizeMarathonProgress = (value: unknown): Record<string, MarathonWorkoutProgress> => {
  if (!isRecord(value)) return {};

  return Object.entries(value).reduce<Record<string, MarathonWorkoutProgress>>((acc, [workoutId, rawProgress]) => {
    if (!isRecord(rawProgress)) return acc;
    const recoverySignal = validRecoverySignals.includes(rawProgress.recoverySignal as RecoverySignal)
      ? (rawProgress.recoverySignal as RecoverySignal)
      : undefined;

    acc[workoutId] = {
      completed: booleanOrUndefined(rawProgress.completed),
      actualPace: stringOrUndefined(rawProgress.actualPace),
      splits: sanitizeSplits(rawProgress.splits),
      notes: stringOrUndefined(rawProgress.notes),
      recoverySignal,
      updatedAtIso: stringOrUndefined(rawProgress.updatedAtIso) ?? new Date().toISOString(),
    };
    return acc;
  }, {});
};

const sanitizeDsaProgress = (value: unknown): Record<string, DsaProblemProgress> => {
  if (!isRecord(value)) return {};

  return Object.entries(value).reduce<Record<string, DsaProblemProgress>>((acc, [problemId, rawProgress]) => {
    if (!isRecord(rawProgress)) return acc;
    acc[problemId] = {
      completed: booleanOrUndefined(rawProgress.completed),
      notes: stringOrUndefined(rawProgress.notes),
      updatedAtIso: stringOrUndefined(rawProgress.updatedAtIso) ?? new Date().toISOString(),
    };
    return acc;
  }, {});
};

export const sanitizeTrackerState = (value: unknown): TrackerState => {
  const fallback = createDefaultTrackerState();
  if (!isRecord(value)) return fallback;

  const settings = isRecord(value.settings) ? value.settings : {};
  const activeTab = validTabs.includes(settings.activeTab as AppTab)
    ? (settings.activeTab as AppTab)
    : fallback.settings.activeTab;

  return {
    schemaVersion: 1,
    settings: {
      marathonStartDate: stringOrUndefined(settings.marathonStartDate) ?? fallback.settings.marathonStartDate,
      hrMarathonStartDate: stringOrUndefined(settings.hrMarathonStartDate) ?? fallback.settings.hrMarathonStartDate,
      activeTab,
      firebaseSyncEnabled: Boolean(settings.firebaseSyncEnabled),
      notificationEnabled: Boolean(settings.notificationEnabled),
      notificationTime: sanitizeNotificationTime(settings.notificationTime, fallback.settings.notificationTime),
      notifyMarathon: booleanOrUndefined(settings.notifyMarathon) ?? fallback.settings.notifyMarathon,
      notifyDsa: booleanOrUndefined(settings.notifyDsa) ?? fallback.settings.notifyDsa,
      lastNotificationDate: stringOrUndefined(settings.lastNotificationDate),
    },
    marathonProgressByWorkoutId: sanitizeMarathonProgress(value.marathonProgressByWorkoutId),
    dsaProgressByProblemId: sanitizeDsaProgress(value.dsaProgressByProblemId),
    sync: isRecord(value.sync)
      ? {
          lastLocalSaveAtIso: stringOrUndefined(value.sync.lastLocalSaveAtIso),
          lastRemoteSaveAtIso: stringOrUndefined(value.sync.lastRemoteSaveAtIso),
          lastRemoteLoadAtIso: stringOrUndefined(value.sync.lastRemoteLoadAtIso),
        }
      : {},
  };
};

const legacyWorkoutIdToStableId = (legacyId: unknown): string | undefined => {
  if (typeof legacyId !== 'string') return undefined;
  const match = /^w(\d+)d(\d+)$/.exec(legacyId);
  if (!match) return undefined;
  return `w${match[1].padStart(2, '0')}-d${match[2].padStart(2, '0')}`;
};

export const migrateLegacyEmbeddedState = (legacy: unknown): Partial<TrackerState> => {
  if (!isRecord(legacy)) return {};
  const marathonProgressByWorkoutId: Record<string, MarathonWorkoutProgress> = {};
  const dsaProgressByProblemId: Record<string, DsaProblemProgress> = {};
  const timestamp = new Date().toISOString();

  const maybePlans = [legacy.plan, legacy.hrPlan].filter(Array.isArray);
  maybePlans.forEach((plan) => {
    plan.forEach((week) => {
      if (!isRecord(week) || !Array.isArray(week.days)) return;
      week.days.forEach((day) => {
        if (!isRecord(day)) return;
        const id = legacyWorkoutIdToStableId(day.id);
        if (!id) return;
        marathonProgressByWorkoutId[id] = {
          completed: booleanOrUndefined(day.completed),
          actualPace: stringOrUndefined(day.actualPace),
          splits: sanitizeSplits(day.splits),
          updatedAtIso: timestamp,
        };
      });
    });
  });

  if (Array.isArray(legacy.dsaPlan)) {
    legacy.dsaPlan.forEach((week) => {
      if (!isRecord(week) || !Array.isArray(week.problems)) return;
      week.problems.forEach((problem) => {
        if (!isRecord(problem) || typeof problem.id !== 'string') return;
        dsaProgressByProblemId[problem.id] = {
          completed: booleanOrUndefined(problem.completed),
          updatedAtIso: timestamp,
        };
      });
    });
  }

  return { marathonProgressByWorkoutId, dsaProgressByProblemId };
};

export const hydrateTrackerState = (value: unknown): TrackerState => {
  if (isRecord(value) && (value.settings || value.marathonProgressByWorkoutId || value.dsaProgressByProblemId)) {
    return sanitizeTrackerState(value);
  }

  const migrated = migrateLegacyEmbeddedState(value);
  const fallback = createDefaultTrackerState();
  return {
    ...fallback,
    marathonProgressByWorkoutId: migrated.marathonProgressByWorkoutId ?? {},
    dsaProgressByProblemId: migrated.dsaProgressByProblemId ?? {},
  };
};

export const readTrackerState = (): TrackerState => {
  if (typeof localStorage === 'undefined') return createDefaultTrackerState();

  const saved = localStorage.getItem(TRACKER_STORAGE_KEY);
  if (saved) {
    try {
      return hydrateTrackerState(JSON.parse(saved));
    } catch {
      return createDefaultTrackerState();
    }
  }

  return createDefaultTrackerState();
};

export const writeTrackerState = (state: TrackerState): void => {
  localStorage.setItem(
    TRACKER_STORAGE_KEY,
    JSON.stringify({
      ...state,
      sync: {
        ...state.sync,
        lastLocalSaveAtIso: new Date().toISOString(),
      },
    }),
  );
};

export const mergeTrackerState = (localState: TrackerState, incoming: TrackerState): TrackerState => ({
  ...localState,
  settings: {
    ...localState.settings,
    ...incoming.settings,
  },
  marathonProgressByWorkoutId: {
    ...localState.marathonProgressByWorkoutId,
    ...incoming.marathonProgressByWorkoutId,
  },
  dsaProgressByProblemId: {
    ...localState.dsaProgressByProblemId,
    ...incoming.dsaProgressByProblemId,
  },
  sync: {
    ...localState.sync,
    ...incoming.sync,
    lastRemoteLoadAtIso: new Date().toISOString(),
  },
});
