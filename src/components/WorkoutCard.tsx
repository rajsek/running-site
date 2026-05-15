import { formatDistance } from '../domain/schedule';
import { CheckCircleIcon, CircleIcon, PlusIcon, TrashIcon } from './icons';
import type { DerivedMarathonWorkout, MarathonWorkoutProgress, RecoverySignal, SplitRecord } from '../types';

const typeClasses: Record<string, string> = {
  rest: 'bg-slate-100 text-slate-600 border-slate-200',
  run: 'bg-green-100 text-green-700 border-green-200',
  'long-run': 'bg-blue-100 text-blue-700 border-blue-200',
  strength: 'bg-slate-100 text-slate-700 border-slate-200',
  'cross-training': 'bg-teal-50 text-teal-700 border-teal-200',
  mobility: 'bg-teal-50 text-teal-700 border-teal-200',
  race: 'bg-amber-100 text-amber-800 border-amber-200 font-bold',
};

const typeLabel = (kind: string): string => {
  if (kind === 'long-run') return 'Long Run';
  if (kind === 'cross-training') return 'Cross/Strength';
  return kind.charAt(0).toUpperCase() + kind.slice(1);
};

export const WorkoutCard = ({
  workout,
  progress,
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
  onToggleComplete: () => void;
  onSetActualPace: (value: string) => void;
  onSetNotes: (value: string) => void;
  onSetRecoverySignal: (value: RecoverySignal) => void;
  onAddSplit: () => void;
  onUpdateSplit: (splitIndex: number, field: keyof SplitRecord, value: string) => void;
  onRemoveSplit: (splitIndex: number) => void;
}) => {
  const completed = Boolean(progress?.completed);
  const distance = formatDistance(workout);
  const splits = progress?.splits ?? [];

  return (
    <article className={`flex flex-col gap-3 p-4 transition-colors hover:bg-slate-50 sm:p-5 ${completed ? 'bg-slate-50/60 opacity-75' : 'bg-white'}`}>
      <div className="flex items-start gap-4 sm:items-center">
        <button
          type="button"
          onClick={onToggleComplete}
          aria-label={completed ? 'Mark workout incomplete' : 'Mark workout complete'}
          className="mt-0.5 shrink-0 text-slate-300 transition hover:text-blue-400 sm:mt-0"
        >
          {completed ? (
            <CheckCircleIcon className="h-6 w-6 scale-110 text-blue-500 transition-transform" />
          ) : (
            <CircleIcon className="h-6 w-6" />
          )}
        </button>

        <div className="w-16 shrink-0">
          <div className="font-semibold text-slate-700">{workout.weekdayShort}</div>
          <div className="text-xs text-slate-400">{workout.monthDayLabel}</div>
        </div>

        <div className="flex min-w-0 flex-grow flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 flex-grow">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`min-w-0 text-base font-semibold leading-snug text-slate-800 sm:text-lg ${completed ? 'line-through text-slate-500' : ''}`}>
                {workout.title}
              </h3>
              {distance ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{distance}</span> : null}
            </div>
          {workout.note ? <p className="mt-1 text-sm text-slate-500">{workout.note}</p> : null}

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Avg pace:</span>
              <input
                value={progress?.actualPace ?? ''}
                onChange={(event) => onSetActualPace(event.target.value)}
                className="h-8 w-24 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-blue-500"
              />
              <button type="button" onClick={onAddSplit} className="inline-flex items-center gap-1 font-semibold text-blue-600 transition hover:text-blue-700">
                <PlusIcon className="h-3.5 w-3.5" />
                Record Splits
              </button>
            </div>
          </div>

          <div className="mt-2 flex shrink-0 flex-row flex-wrap items-center gap-2 sm:mt-0 sm:flex-col sm:items-end">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeClasses[workout.kind] ?? typeClasses.run}`}>
              {typeLabel(workout.kind)}
            </span>
            <select
              value={progress?.recoverySignal ?? 'ok'}
              onChange={(event) => onSetRecoverySignal(event.target.value as RecoverySignal)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 outline-none focus:border-blue-500"
            >
              <option value="ok">OK</option>
              <option value="watch">Watch</option>
              <option value="fatigue">Fatigue</option>
              <option value="pain">Pain</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:ml-[7.75rem] sm:max-w-xl">
        {splits.length ? (
          <div className="space-y-2 border-l-2 border-blue-100 pl-3">
            {splits.map((split, index) => (
              <div key={`${workout.id}-split-${index}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2rem] gap-2">
                <input
                  value={split.distance}
                  onChange={(event) => onUpdateSplit(index, 'distance', event.target.value)}
                  placeholder="Dist"
                  className="h-8 min-w-0 rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-blue-500"
                />
                <input
                  value={split.pace}
                  onChange={(event) => onUpdateSplit(index, 'pace', event.target.value)}
                  placeholder="Pace"
                  className="h-8 min-w-0 rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-blue-500"
                />
                <button type="button" onClick={() => onRemoveSplit(index)} aria-label="Remove split" className="flex h-8 items-center justify-center text-slate-400 hover:text-red-600">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <details className="group w-full text-xs text-slate-500">
          <summary className="cursor-pointer list-none font-semibold text-slate-400 transition hover:text-slate-700">
            {progress?.notes ? 'Edit notes' : 'Add notes'}
          </summary>
          <input
            value={progress?.notes ?? ''}
            onChange={(event) => onSetNotes(event.target.value)}
            placeholder="Notes"
            className="mt-2 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-sm outline-none focus:border-blue-500"
          />
        </details>
      </div>
    </article>
  );
};
