import type {
  DsaProblemProgress,
  MarathonWorkoutProgress,
  RecoverySignal,
  SplitRecord,
  TrackerState,
} from '../types';

const nowIso = (): string => new Date().toISOString();

const progressWithTimestamp = (progress: Partial<MarathonWorkoutProgress>): MarathonWorkoutProgress => ({
  ...progress,
  updatedAtIso: nowIso(),
});

const dsaProgressWithTimestamp = (progress: Partial<DsaProblemProgress>): DsaProblemProgress => ({
  ...progress,
  updatedAtIso: nowIso(),
});

export const updateMarathonProgress = (
  state: TrackerState,
  workoutId: string,
  updater: (progress: MarathonWorkoutProgress) => MarathonWorkoutProgress,
): TrackerState => {
  const current = state.marathonProgressByWorkoutId[workoutId] ?? progressWithTimestamp({});
  return {
    ...state,
    marathonProgressByWorkoutId: {
      ...state.marathonProgressByWorkoutId,
      [workoutId]: updater(current),
    },
  };
};

export const toggleWorkoutCompletion = (state: TrackerState, workoutId: string): TrackerState =>
  updateMarathonProgress(state, workoutId, (current) =>
    progressWithTimestamp({ ...current, completed: !current.completed }),
  );

export const setActualPace = (state: TrackerState, workoutId: string, actualPace: string): TrackerState =>
  updateMarathonProgress(state, workoutId, (current) =>
    progressWithTimestamp({ ...current, actualPace }),
  );

export const setWorkoutNotes = (state: TrackerState, workoutId: string, notes: string): TrackerState =>
  updateMarathonProgress(state, workoutId, (current) =>
    progressWithTimestamp({ ...current, notes }),
  );

export const setRecoverySignal = (
  state: TrackerState,
  workoutId: string,
  recoverySignal: RecoverySignal,
): TrackerState =>
  updateMarathonProgress(state, workoutId, (current) =>
    progressWithTimestamp({ ...current, recoverySignal }),
  );

export const addSplit = (state: TrackerState, workoutId: string): TrackerState =>
  updateMarathonProgress(state, workoutId, (current) =>
    progressWithTimestamp({
      ...current,
      splits: [...(current.splits ?? []), { distance: '1', pace: '' }],
    }),
  );

export const updateSplit = (
  state: TrackerState,
  workoutId: string,
  splitIndex: number,
  field: keyof SplitRecord,
  value: string,
): TrackerState =>
  updateMarathonProgress(state, workoutId, (current) => {
    const splits = [...(current.splits ?? [])];
    if (!splits[splitIndex]) return progressWithTimestamp(current);
    splits[splitIndex] = { ...splits[splitIndex], [field]: value };
    return progressWithTimestamp({ ...current, splits });
  });

export const removeSplit = (state: TrackerState, workoutId: string, splitIndex: number): TrackerState =>
  updateMarathonProgress(state, workoutId, (current) =>
    progressWithTimestamp({
      ...current,
      splits: (current.splits ?? []).filter((_, index) => index !== splitIndex),
    }),
  );

export const toggleDsaProblemCompletion = (state: TrackerState, problemId: string): TrackerState => {
  const current = state.dsaProgressByProblemId[problemId] ?? dsaProgressWithTimestamp({});
  return {
    ...state,
    dsaProgressByProblemId: {
      ...state.dsaProgressByProblemId,
      [problemId]: dsaProgressWithTimestamp({ ...current, completed: !current.completed }),
    },
  };
};

export const setDsaProblemNotes = (state: TrackerState, problemId: string, notes: string): TrackerState => {
  const current = state.dsaProgressByProblemId[problemId] ?? dsaProgressWithTimestamp({});
  return {
    ...state,
    dsaProgressByProblemId: {
      ...state.dsaProgressByProblemId,
      [problemId]: dsaProgressWithTimestamp({ ...current, notes }),
    },
  };
};
