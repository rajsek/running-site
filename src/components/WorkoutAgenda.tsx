import { formatDistance } from '../domain/schedule';
import { CheckCircleIcon, CircleIcon, PlusIcon, TrashIcon } from './icons';
import type { DerivedMarathonWorkout, MarathonWorkoutProgress, RecoverySignal, SplitRecord } from '../types';

const kindClass: Record<string, string> = {
  rest: 'bg-slate-100 text-slate-600',
  run: 'bg-green-100 text-green-700',
  'long-run': 'bg-blue-100 text-blue-700',
  strength: 'bg-slate-100 text-slate-700',
  'cross-training': 'bg-teal-50 text-teal-700',
  mobility: 'bg-teal-50 text-teal-700',
  race: 'bg-amber-100 text-amber-800 font-bold',
};

const recoveryClass: Record<RecoverySignal, string> = {
  ok: 'text-green-700 bg-green-50',
  watch: 'text-amber-700 bg-amber-50',
  fatigue: 'text-orange-700 bg-orange-50',
  pain: 'text-red-700 bg-red-50',
};

const kindLabel = (kind: string): string => {
  if (kind === 'long-run') return 'Long';
  if (kind === 'cross-training') return 'Cross';
  return kind.charAt(0).toUpperCase() + kind.slice(1);
};

export const WorkoutAgendaRow = ({
  workout,
  progress,
  selected,
  onToggleComplete,
  onOpenDetails,
}: {
  workout: DerivedMarathonWorkout;
  progress?: MarathonWorkoutProgress;
  selected: boolean;
  onToggleComplete: () => void;
  onOpenDetails: () => void;
}) => {
  const completed = Boolean(progress?.completed);
  const distance = formatDistance(workout);
  const recoverySignal = progress?.recoverySignal ?? 'ok';

  return (
    <div
      className={`grid grid-cols-[2.25rem_4rem_minmax(0,1fr)] items-center gap-3 border-b border-slate-100 px-3 py-3 transition hover:bg-slate-50 sm:grid-cols-[2.5rem_5rem_minmax(0,1fr)_8rem_5rem_5rem] sm:px-5 ${
        selected ? 'bg-blue-50/70' : completed ? 'bg-slate-50/50' : 'bg-white'
      }`}
    >
      <button
        type="button"
        onClick={onToggleComplete}
        aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
        className="flex h-8 w-8 items-center justify-center text-slate-300 transition hover:text-blue-500"
      >
        {completed ? <CheckCircleIcon className="h-5 w-5 text-blue-500" /> : <CircleIcon className="h-5 w-5" />}
      </button>

      <div className="text-sm">
        <div className="font-black text-slate-800">{workout.weekdayShort}</div>
        <div className="text-xs font-medium text-slate-400">{workout.monthDayLabel}</div>
      </div>

      <button type="button" onClick={onOpenDetails} className="min-w-0 text-left">
        <div className={`truncate text-sm font-bold sm:text-base ${completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
          {workout.title}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:hidden">
          {distance ? <span>{distance}</span> : null}
          <span className={`rounded-full px-2 py-0.5 font-bold ${kindClass[workout.kind] ?? kindClass.run}`}>{kindLabel(workout.kind)}</span>
        </div>
        {workout.note ? <div className="mt-1 hidden truncate text-xs text-slate-500 sm:block">{workout.note}</div> : null}
      </button>

      <div className="hidden text-sm font-semibold text-slate-500 sm:block">{distance || '-'}</div>
      <div className="hidden sm:block">
        <span className={`rounded-full px-2 py-1 text-xs font-bold ${kindClass[workout.kind] ?? kindClass.run}`}>
          {kindLabel(workout.kind)}
        </span>
      </div>
      <div className="hidden sm:block">
        <span className={`rounded-full px-2 py-1 text-xs font-bold ${recoveryClass[recoverySignal]}`}>
          {recoverySignal}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenDetails}
        className="col-span-3 h-8 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 transition hover:bg-slate-200 sm:col-span-1 sm:hidden"
      >
        Log details
      </button>
    </div>
  );
};

export const WorkoutDetailDrawer = ({
  workout,
  progress,
  onClose,
  onToggleComplete,
  onSetActualPace,
  onSetNotes,
  onSetRecoverySignal,
  onAddSplit,
  onUpdateSplit,
  onRemoveSplit,
}: {
  workout: DerivedMarathonWorkout;
  progress?: MarathonWorkoutProgress;
  onClose: () => void;
  onToggleComplete: () => void;
  onSetActualPace: (value: string) => void;
  onSetNotes: (value: string) => void;
  onSetRecoverySignal: (value: RecoverySignal) => void;
  onAddSplit: () => void;
  onUpdateSplit: (splitIndex: number, field: keyof SplitRecord, value: string) => void;
  onRemoveSplit: (splitIndex: number) => void;
}) => {
  const completed = Boolean(progress?.completed);
  const splits = progress?.splits ?? [];
  const distance = formatDistance(workout);

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/20">
      <aside className="fixed inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto border-t border-slate-200 bg-white shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[28rem] sm:border-l sm:border-t-0">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                {workout.weekdayLong} · {workout.monthDayLabel}
              </p>
              <h2 className="mt-1 text-xl font-black leading-tight text-slate-950">{workout.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {distance ? <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{distance}</span> : null}
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${kindClass[workout.kind] ?? kindClass.run}`}>
                  {kindLabel(workout.kind)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close workout details"
            >
              x
            </button>
          </div>
        </div>

        <div className="space-y-6 px-5 py-5">
          <button
            type="button"
            onClick={onToggleComplete}
            className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-black transition ${
              completed ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {completed ? <CheckCircleIcon className="h-5 w-5" /> : <CircleIcon className="h-5 w-5" />}
            {completed ? 'Completed' : 'Mark complete'}
          </button>

          <label className="block text-sm font-bold text-slate-700">
            Average pace
            <input
              value={progress?.actualPace ?? ''}
              onChange={(event) => onSetActualPace(event.target.value)}
              placeholder="7:45 / km"
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Recovery signal
            <select
              value={progress?.recoverySignal ?? 'ok'}
              onChange={(event) => onSetRecoverySignal(event.target.value as RecoverySignal)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option value="ok">OK</option>
              <option value="watch">Watch</option>
              <option value="fatigue">Fatigue</option>
              <option value="pain">Pain</option>
            </select>
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-sm font-black text-slate-800">Splits</h3>
              <button
                type="button"
                onClick={onAddSplit}
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-slate-100 px-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Add lap
              </button>
            </div>
            <div className="space-y-2">
              {splits.length ? (
                splits.map((split, index) => (
                  <div key={`${workout.id}-split-${index}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.25rem] gap-2">
                    <input
                      value={split.distance}
                      onChange={(event) => onUpdateSplit(index, 'distance', event.target.value)}
                      placeholder="Distance"
                      className="h-10 min-w-0 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                    />
                    <input
                      value={split.pace}
                      onChange={(event) => onUpdateSplit(index, 'pace', event.target.value)}
                      placeholder="Pace"
                      className="h-10 min-w-0 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveSplit(index)}
                      aria-label="Remove split"
                      className="flex h-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="border-y border-slate-100 py-3 text-sm text-slate-500">No splits recorded yet.</p>
              )}
            </div>
          </div>

          <label className="block text-sm font-bold text-slate-700">
            Notes
            <textarea
              value={progress?.notes ?? ''}
              onChange={(event) => onSetNotes(event.target.value)}
              placeholder="How did this session feel?"
              rows={4}
              className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>
        </div>
      </aside>
    </div>
  );
};
