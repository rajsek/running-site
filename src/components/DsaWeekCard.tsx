import type { DsaProblemProgress, DsaWeekTemplate } from '../types';
import { CheckCircleIcon, CircleIcon } from './icons';

const difficultyClass: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700',
};

export const DsaWeekCard = ({
  week,
  progressByProblemId,
  onToggleProblem,
}: {
  week: DsaWeekTemplate;
  progressByProblemId: Record<string, DsaProblemProgress>;
  onToggleProblem: (problemId: string) => void;
  onSetProblemNotes: (problemId: string, notes: string) => void;
}) => {
  const completed = week.problems.filter((problem) => progressByProblemId[problem.id]?.completed).length;

  return (
    <section className="border-b border-slate-100 last:border-b-0">
      <div className="grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-3 bg-slate-50 px-4 py-3">
        <h3 className="min-w-0 text-sm font-black uppercase tracking-wide text-slate-700">
          Week {week.weekIndex}: {week.topic}
        </h3>
        <span className="justify-self-end rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">
          {completed}/{week.problems.length}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {week.problems.map((problem) => {
          const isComplete = Boolean(progressByProblemId[problem.id]?.completed);
          return (
            <button
              key={problem.id}
              type="button"
              onClick={() => onToggleProblem(problem.id)}
              className={`grid w-full grid-cols-[2rem_minmax(0,1fr)_4.25rem] items-center gap-3 px-4 py-3 text-left transition-colors ${
                isComplete ? 'bg-slate-50/70 opacity-70' : 'bg-white hover:bg-slate-50'
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center text-slate-300">
                {isComplete ? <CheckCircleIcon className="h-5 w-5 text-blue-500" /> : <CircleIcon className="h-5 w-5" />}
              </span>
              <span className={`min-w-0 flex-1 text-sm leading-tight ${isComplete ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                {problem.name}
              </span>
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${difficultyClass[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
