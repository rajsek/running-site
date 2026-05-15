export type ISODate = string;

export type WorkoutKind =
  | 'run'
  | 'long-run'
  | 'strength'
  | 'cross-training'
  | 'mobility'
  | 'rest'
  | 'race';

export type WorkoutIntensity =
  | 'easy'
  | 'recovery'
  | 'steady'
  | 'tempo'
  | 'intervals'
  | 'long'
  | 'rest'
  | 'race';

export type WeekPhase = 'base' | 'recovery' | 'build' | 'peak' | 'taper' | 'race';
export type RecoverySignal = 'ok' | 'watch' | 'fatigue' | 'pain';
export type DsaDifficulty = 'Easy' | 'Medium' | 'Hard';
export type AppTab = 'marathon' | 'hrMarathon' | 'dsa' | 'reference' | 'settings';

export interface PaceZone {
  id: string;
  label: string;
  pace: string;
}

export interface MarathonWorkoutTemplate {
  id: string;
  weekIndex: number;
  dayOffset: number;
  title: string;
  kind: WorkoutKind;
  intensity: WorkoutIntensity;
  plannedDistanceKm?: number;
  plannedDistanceRangeKm?: [number, number];
  durationMinutes?: number;
  paceZoneId?: string;
  isLongRun?: boolean;
  note?: string;
}

export interface DerivedMarathonWorkout extends MarathonWorkoutTemplate {
  date: ISODate;
  weekdayShort: string;
  weekdayLong: string;
  monthDayLabel: string;
}

export interface DerivedMarathonWeek {
  weekIndex: number;
  phase: WeekPhase;
  startDate: ISODate;
  endDate: ISODate;
  rangeLabel: string;
  workouts: DerivedMarathonWorkout[];
}

export interface SplitRecord {
  distance: string;
  pace: string;
}

export interface MarathonWorkoutProgress {
  completed?: boolean;
  actualPace?: string;
  splits?: SplitRecord[];
  notes?: string;
  recoverySignal?: RecoverySignal;
  updatedAtIso: string;
}

export interface DsaProblemTemplate {
  id: string;
  name: string;
  difficulty: DsaDifficulty;
}

export interface DsaWeekTemplate {
  weekIndex: number;
  topic: string;
  problems: DsaProblemTemplate[];
}

export interface DsaProblemProgress {
  completed?: boolean;
  notes?: string;
  updatedAtIso: string;
}

export interface TrackerSettings {
  marathonStartDate: ISODate;
  hrMarathonStartDate: ISODate;
  activeTab: AppTab;
  firebaseSyncEnabled: boolean;
  notificationEnabled: boolean;
  notificationTime: string;
  notifyMarathon: boolean;
  notifyDsa: boolean;
  lastNotificationDate?: ISODate;
}

export interface TrackerSyncMeta {
  lastLocalSaveAtIso?: string;
  lastRemoteSaveAtIso?: string;
  lastRemoteLoadAtIso?: string;
}

export interface TrackerState {
  schemaVersion: 1;
  settings: TrackerSettings;
  marathonProgressByWorkoutId: Record<string, MarathonWorkoutProgress>;
  dsaProgressByProblemId: Record<string, DsaProblemProgress>;
  sync: TrackerSyncMeta;
}

export interface MarathonSummary {
  totalWorkouts: number;
  completedWorkouts: number;
  totalRuns: number;
  completedRuns: number;
  flaggedWorkouts: number;
  nextWorkout?: DerivedMarathonWorkout;
  raceWorkout?: DerivedMarathonWorkout;
}

export interface DsaSummary {
  totalProblems: number;
  completedProblems: number;
  activeWeekIndex: number;
}

export interface FirebaseSyncStatus {
  mode: 'disabled' | 'connecting' | 'ready' | 'error';
  message: string;
}
