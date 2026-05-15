import { summarizeWeekCompletion } from '../domain/schedule';
import type { DerivedMarathonWeek, MarathonWorkoutProgress } from '../types';

export const WeekPicker = ({
  weeks,
  selectedWeek,
  progressByWorkoutId,
  onSelectWeek,
}: {
  weeks: DerivedMarathonWeek[];
  selectedWeek: number;
  progressByWorkoutId: Record<string, MarathonWorkoutProgress>;
  onSelectWeek: (weekIndex: number) => void;
}) => (
  <div className="mb-8 overflow-x-auto pb-2 hide-scrollbar">
    <div className="flex gap-2">
      {weeks.map((week) => {
        const summary = summarizeWeekCompletion(week, progressByWorkoutId);
        const isSelected = week.weekIndex === selectedWeek;
        const isComplete = summary.total > 0 && summary.completed === summary.total;

        return (
          <button
            key={week.weekIndex}
            type="button"
            onClick={() => onSelectWeek(week.weekIndex)}
            className={`flex min-w-[4.5rem] flex-col items-center justify-center whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-all ${
              isSelected
                ? 'scale-105 border-blue-600 bg-blue-600 text-white shadow-md'
                : isComplete
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="mb-0.5 font-semibold">Wk {week.weekIndex}</span>
            <span className="text-xs opacity-80">{summary.completed}/{summary.total}</span>
          </button>
        );
      })}
    </div>
  </div>
);
