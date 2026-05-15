import { useCallback, useEffect, useRef, useState } from 'react';
import { DsaWeekCard } from './components/DsaWeekCard';
import {
  ActivityIcon,
  AlertIcon,
  BellIcon,
  CalendarIcon,
  CodeIcon,
  DownloadIcon,
  DumbbellIcon,
  HeartPulseIcon,
  MobilityIcon,
  RunnerIcon,
  SettingsIcon,
  UploadIcon,
} from './components/icons';
import { WeekPicker } from './components/WeekPicker';
import { WorkoutAgendaRow, WorkoutDetailDrawer } from './components/WorkoutAgenda';
import { paceZones } from './data/marathonPlanTemplate';
import {
  buildDailyReminderPayload,
  getBrowserNotificationPermission,
  getLocalIsoDate,
  isDailyReminderDue,
  requestBrowserNotificationPermission,
  showBrowserNotification,
  type BrowserNotificationPermission,
  type DailyReminderPayload,
} from './domain/notifications';
import { formatLongDate } from './domain/schedule';
import { useTrainingTracker } from './hooks/useTrainingTracker';
import { useUrlTabRoute } from './hooks/useUrlTabRoute';
import type { AppTab, DerivedMarathonWorkout, DsaProblemTemplate, DsaWeekTemplate, MarathonWorkoutProgress } from './types';

type IconComponent = typeof ActivityIcon;

const tabs: Array<{ id: AppTab; label: string; icon: IconComponent }> = [
  { id: 'marathon', label: 'Original 16-Week', icon: CalendarIcon },
  { id: 'hrMarathon', label: 'HR 18-Week', icon: RunnerIcon },
  { id: 'dsa', label: 'Job Prep (DSA)', icon: CodeIcon },
  { id: 'reference', label: 'Pace Zones', icon: ActivityIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const exportJson = (data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `training-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const TabButton = ({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: IconComponent;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-bold transition sm:text-base ${
      active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-slate-500 hover:text-slate-800'
    }`}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
);

const formatRaceDisplay = (date: string | undefined): string => {
  if (!date) return '-- / -- / ----';
  const [year, month, day] = date.split('-');
  return `${day} / ${month} / ${year}`;
};

const formatNotificationPermission = (permission: BrowserNotificationPermission): string => {
  if (permission === 'unsupported') return 'Browser notifications are not supported in this browser.';
  if (permission === 'granted') return 'Browser permission granted.';
  if (permission === 'denied') return 'Browser permission denied. Re-enable it from site settings.';
  return 'Browser permission not requested yet.';
};

const formatBrowserDeliveryFailure = (reason: string | undefined): string => {
  if (reason === 'permission-not-granted') return 'Browser notification is not allowed, so only the in-app reminder is shown.';
  if (!reason) return 'Browser notification was not visible, so only the in-app reminder is shown.';
  return `Browser notification was not visible: ${reason}`;
};

const ForegroundReminder = ({
  payload,
  onDismiss,
  onOpenSettings,
}: {
  payload: DailyReminderPayload;
  onDismiss: () => void;
  onOpenSettings: () => void;
}) => (
  <div
    className="reminder-toast fixed inset-x-3 top-3 z-50 mx-auto max-w-xl sm:inset-x-auto sm:right-4 sm:mx-0 sm:w-[28rem]"
    role="status"
    aria-live="polite"
  >
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-2xl shadow-slate-300/40 ring-1 ring-slate-950/5">
      <div className="h-1.5 bg-blue-600" />
      <div className="flex items-start gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <BellIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-blue-700">Reminder</p>
              <h2 className="mt-0.5 text-lg font-black text-slate-950">{payload.title}</h2>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Dismiss reminder"
            >
              x
            </button>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm font-medium leading-6 text-slate-700">{payload.body}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex h-9 items-center rounded-lg bg-blue-600 px-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Got it
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex h-9 items-center rounded-lg bg-slate-100 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Reminder settings
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const getNextDsaItem = (
  weeks: DsaWeekTemplate[],
  progressByProblemId: Record<string, { completed?: boolean }>,
): { week: DsaWeekTemplate; problem: DsaProblemTemplate } | undefined => {
  for (const week of weeks) {
    const problem = week.problems.find((item) => !progressByProblemId[item.id]?.completed);
    if (problem) return { week, problem };
  }
  return undefined;
};

const TodayFocusStrip = ({
  workout,
  progress,
  dsaItem,
  onToggleWorkout,
  onOpenWorkout,
  onOpenDsa,
}: {
  workout?: DerivedMarathonWorkout;
  progress?: MarathonWorkoutProgress;
  dsaItem?: { week: DsaWeekTemplate; problem: DsaProblemTemplate };
  onToggleWorkout: () => void;
  onOpenWorkout: () => void;
  onOpenDsa: () => void;
}) => (
  <section className="mb-6 border-y border-slate-200 bg-white">
    <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
      <div className="border-b border-slate-100 p-4 md:border-b-0 md:border-r md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-blue-600">Today</p>
            {workout ? (
              <>
                <h2 className="mt-1 truncate text-xl font-black text-slate-950">{workout.title}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {workout.weekdayLong} · {workout.monthDayLabel}
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-1 text-xl font-black text-slate-950">No workout scheduled</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Use the agenda below to plan ahead.</p>
              </>
            )}
          </div>
          {workout ? (
            <button
              type="button"
              onClick={onToggleWorkout}
              className={`h-10 shrink-0 rounded-lg px-3 text-sm font-black transition ${
                progress?.completed ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {progress?.completed ? 'Done' : 'Mark done'}
            </button>
          ) : null}
        </div>
        {workout ? (
          <button
            type="button"
            onClick={onOpenWorkout}
            className="mt-4 h-9 rounded-lg bg-slate-100 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
          >
            Log pace, splits, notes
          </button>
        ) : null}
      </div>

      <div className="p-4 md:p-5">
        <p className="text-xs font-black uppercase tracking-wide text-indigo-600">Next DSA</p>
        {dsaItem ? (
          <>
            <h3 className="mt-1 text-base font-black text-slate-950">{dsaItem.problem.name}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Week {dsaItem.week.weekIndex} · {dsaItem.week.topic} · {dsaItem.problem.difficulty}
            </p>
            <button
              type="button"
              onClick={onOpenDsa}
              className="mt-4 h-9 rounded-lg bg-slate-100 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Open DSA queue
            </button>
          </>
        ) : (
          <p className="mt-1 text-sm font-medium text-slate-500">All listed DSA problems are complete.</p>
        )}
      </div>
    </div>
  </section>
);

const ReferenceView = () => (
  <section className="animate-in fade-in space-y-6 duration-300">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
          <ActivityIcon className="h-5 w-5 text-blue-500" />
          Pace Zones
        </h3>
        <ul className="space-y-3 text-base">
          {paceZones.filter((zone) => zone.id !== 'walk').map((zone) => (
            <li key={zone.id} className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-1">
              <span className="font-bold text-slate-800">{zone.label}</span>
              <span className="whitespace-nowrap font-medium text-slate-500">{zone.pace}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-start gap-2 text-sm font-medium text-slate-500">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span>80% of training should feel easy. Never try to "prove fitness" during training.</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
            <HeartPulseIcon className="h-5 w-5 text-red-500" />
            Recovery Rules (Mandatory)
          </h3>
          <ul className="space-y-2 text-base text-slate-700">
            <li><strong className="text-slate-950">Sleep:</strong> 7+ hours nightly</li>
            <li><strong className="text-slate-950">Hydration:</strong> Daily consistency</li>
            <li><strong className="text-slate-950">Nutrition:</strong> 90-110g protein/day</li>
            <li><strong className="text-slate-950">Gear:</strong> Replace shoes every 600-700 km</li>
          </ul>
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-800">
            <strong>Injury Warning:</strong> If pain changes your stride, stop training immediately. Missing a workout is better than an 8-week injury.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
            <DumbbellIcon className="h-5 w-5 text-violet-500" />
            Strength (2x Weekly)
          </h3>
          <p className="mb-3 text-sm font-medium text-slate-500">Avoid heavy gym fatigue. Goal is injury prevention.</p>
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            {['Glute bridges', 'Split squats & Calf raises', 'Hamstring bridges & Step-ups', 'Plank & Side plank', 'Dead bug & Hip drills'].map((item) => (
              <span key={item} className="rounded border border-violet-100 bg-violet-50 px-2.5 py-1 text-violet-700">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 p-5">
        <h3 className="flex items-center gap-2 text-xl font-black text-slate-950">
          <MobilityIcon className="h-5 w-5 text-teal-600" />
          Cross-Training & Mobility Variations
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="w-1/4 px-4 py-3">Session Type</th>
              <th className="w-1/4 px-4 py-3">Weekly Goal</th>
              <th className="w-1/2 px-4 py-3">Variations to Try</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="align-top hover:bg-slate-50">
              <td className="px-4 py-4 font-bold text-slate-900">Rest + Mobility</td>
              <td className="px-4 py-4 text-slate-600">Promote blood flow, reduce stiffness, and restore joint range of motion without fatigue.</td>
              <td className="space-y-2 px-4 py-4 text-slate-600">
                <p><strong className="text-slate-800">Option A:</strong> 15-20 min foam rolling + static stretching for calves, quads, and hips.</p>
                <p><strong className="text-slate-800">Option B:</strong> 20 min yoga-for-runners flow with easy breathing.</p>
                <p><strong className="text-slate-800">Option C:</strong> 15 min walk plus leg swings, hip circles, and ankle mobility.</p>
              </td>
            </tr>
            <tr className="align-top hover:bg-slate-50">
              <td className="px-4 py-4 font-bold text-slate-900">Strength + Walk</td>
              <td className="px-4 py-4 text-slate-600">Build resilience and maintain aerobic rhythm through low-impact work.</td>
              <td className="space-y-2 px-4 py-4 text-slate-600">
                <p><strong className="text-slate-800">At home:</strong> Planks, bridges, lunges, and a brisk outdoor walk.</p>
                <p><strong className="text-slate-800">Gym:</strong> Light goblet squats or step-ups plus incline treadmill walking.</p>
                <p><strong className="text-slate-800">Low impact:</strong> Pilates plus easy cycling or swimming.</p>
              </td>
            </tr>
            <tr className="align-top hover:bg-slate-50">
              <td className="px-4 py-4 font-bold text-slate-900">Pure Cross-Training</td>
              <td className="px-4 py-4 text-slate-600">Build aerobic base while giving joints a break from impact.</td>
              <td className="space-y-2 px-4 py-4 text-slate-600">
                <p><strong className="text-slate-800">Cycling:</strong> 45-60 min easy spin at high cadence.</p>
                <p><strong className="text-slate-800">Swimming:</strong> 30-40 min freestyle or aqua jogging.</p>
                <p><strong className="text-slate-800">Elliptical:</strong> 30-45 min steady with upright posture.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default function App() {
  const tracker = useTrainingTracker();
  const [notificationPermission, setNotificationPermission] = useState<BrowserNotificationPermission>(() =>
    getBrowserNotificationPermission(),
  );
  const [notificationMessage, setNotificationMessage] = useState('');
  const [activeReminder, setActiveReminder] = useState<DailyReminderPayload | null>(null);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const { navigateTab, navigateWeek } = useUrlTabRoute(
    tracker.state.settings.activeTab,
    tracker.setActiveTab,
    tracker.selectedWeek,
    tracker.setSelectedWeek,
  );
  const importInputRef = useRef<HTMLInputElement>(null);
  const notificationSendingRef = useRef(false);
  const isHrMarathon = tracker.state.settings.activeTab === 'hrMarathon';
  const activeTrainingWeeks = isHrMarathon ? tracker.hrMarathonWeeks : tracker.marathonWeeks;
  const activeTrainingSummary = isHrMarathon ? tracker.hrMarathonSummary : tracker.marathonSummary;
  const activeStartDate = isHrMarathon ? tracker.state.settings.hrMarathonStartDate : tracker.state.settings.marathonStartDate;
  const setActiveStartDate = isHrMarathon ? tracker.setHrMarathonStartDate : tracker.setMarathonStartDate;
  const activePlanRouteTab: AppTab = isHrMarathon ? 'hrMarathon' : 'marathon';
  const selectedWeek = activeTrainingWeeks.find((week) => week.weekIndex === tracker.selectedWeek) ?? activeTrainingWeeks[0];
  const raceDate = activeTrainingSummary.raceWorkout?.date;
  const dailyReminderPayload = buildDailyReminderPayload(tracker.state, activeTrainingWeeks);
  const allWorkouts = activeTrainingWeeks.flatMap((week) => week.workouts);
  const todayWorkout = allWorkouts.find((workout) => workout.date === getLocalIsoDate());
  const focusWorkout = todayWorkout ?? activeTrainingSummary.nextWorkout;
  const activeWorkout = activeWorkoutId ? allWorkouts.find((workout) => workout.id === activeWorkoutId) : undefined;
  const nextDsaItem = getNextDsaItem(tracker.dsaWeeks, tracker.state.dsaProgressByProblemId);

  useEffect(() => {
    if (!activeTrainingWeeks.some((week) => week.weekIndex === tracker.selectedWeek)) {
      tracker.setSelectedWeek(activeTrainingWeeks[0]?.weekIndex ?? 1);
    }
  }, [activeTrainingWeeks, tracker.selectedWeek, tracker.setSelectedWeek]);

  useEffect(() => {
    setNotificationPermission(getBrowserNotificationPermission());
  }, []);

  const deliverReminder = useCallback(
    async (payload: DailyReminderPayload, options: { markSent?: boolean; test?: boolean } = {}) => {
      setActiveReminder(payload);
      if (options.markSent) {
        tracker.setLastNotificationDate(payload.todayIso);
      }

      const result = await showBrowserNotification(payload);
      setNotificationMessage(
        result.browserShown
          ? `${options.test ? 'Test' : 'Daily'} reminder shown in app and sent to the browser.`
          : `${options.test ? 'Test' : 'Daily'} reminder shown in app. ${formatBrowserDeliveryFailure(result.reason)}`,
      );
    },
    [tracker],
  );

  useEffect(() => {
    const trySendDailyReminder = () => {
      if (notificationSendingRef.current) return;
      const payload = buildDailyReminderPayload(tracker.state, tracker.marathonWeeks);
      if (!payload || !isDailyReminderDue(tracker.state.settings)) return;

      notificationSendingRef.current = true;
      void deliverReminder(payload, { markSent: true }).finally(() => {
        notificationSendingRef.current = false;
      });
    };

    trySendDailyReminder();
    const intervalId = window.setInterval(trySendDailyReminder, 60_000);
    return () => window.clearInterval(intervalId);
  }, [deliverReminder, tracker.state, tracker.marathonWeeks]);

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    tracker.importState(JSON.parse(text));
    if (importInputRef.current) importInputRef.current.value = '';
  };

  const handleNotificationEnabledChange = async (enabled: boolean) => {
    setNotificationMessage('');
    if (!enabled) {
      tracker.setNotificationEnabled(false);
      return;
    }

    const currentPermission = getBrowserNotificationPermission();
    const permission = currentPermission === 'default'
      ? await requestBrowserNotificationPermission()
      : currentPermission;
    setNotificationPermission(permission);

    tracker.setNotificationEnabled(true);
    if (permission === 'granted') {
      setNotificationMessage('Daily reminders are enabled in the app and browser.');
      return;
    }

    setNotificationMessage(`Daily in-app reminders are enabled. ${formatNotificationPermission(permission)}`);
  };

  const handleTestNotification = async () => {
    const currentPermission = getBrowserNotificationPermission();
    const permission = currentPermission === 'default'
      ? await requestBrowserNotificationPermission()
      : currentPermission;
    setNotificationPermission(permission);

    const payload = dailyReminderPayload ?? {
      title: 'Training reminder',
      body: 'Notifications are working. No active marathon or DSA item is due today.',
      todayIso: getLocalIsoDate(),
    };
    await deliverReminder(payload, { test: true });
  };

  const notificationPermissionText = formatNotificationPermission(notificationPermission);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {activeReminder && (
        <ForegroundReminder
          payload={activeReminder}
          onDismiss={() => setActiveReminder(null)}
          onOpenSettings={() => {
            navigateTab('settings');
            setActiveReminder(null);
          }}
        />
      )}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200">
                <RunnerIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-black tracking-tight text-slate-950">Marathon 2026 Tracker</h1>
                <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm shadow-sm">
                  <span className="font-bold text-slate-600">Target Race Date:</span>
                  <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-black text-blue-600">
                    {formatRaceDisplay(raceDate)}
                    <CalendarIcon className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => exportJson({ ...tracker.state, exportedAtIso: new Date().toISOString() })}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                <DownloadIcon className="h-4 w-4" />
                Export Data
              </button>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                <UploadIcon className="h-4 w-4" />
                Import
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => void handleImportFile(event.target.files?.[0])}
              />
            </div>
          </div>

          <nav className="mt-6 flex gap-5 overflow-x-auto border-b border-slate-200 hide-scrollbar">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={tracker.state.settings.activeTab === tab.id}
                icon={tab.icon}
                label={tab.label}
                onClick={() => navigateTab(tab.id)}
              />
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {(tracker.state.settings.activeTab === 'marathon' || tracker.state.settings.activeTab === 'hrMarathon') && (
          <section>
            <TodayFocusStrip
              workout={focusWorkout}
              progress={focusWorkout ? tracker.state.marathonProgressByWorkoutId[focusWorkout.id] : undefined}
              dsaItem={nextDsaItem}
              onToggleWorkout={() => {
                if (focusWorkout) tracker.toggleWorkoutCompletion(focusWorkout.id);
              }}
              onOpenWorkout={() => {
                if (focusWorkout) {
                  setActiveWorkoutId(focusWorkout.id);
                  navigateWeek(focusWorkout.weekIndex, activePlanRouteTab);
                }
              }}
              onOpenDsa={() => navigateTab('dsa')}
            />

            <WeekPicker
              weeks={activeTrainingWeeks}
              selectedWeek={tracker.selectedWeek}
              progressByWorkoutId={tracker.state.marathonProgressByWorkoutId}
              onSelectWeek={(weekIndex) => navigateWeek(weekIndex, activePlanRouteTab)}
            />

            <div className="overflow-hidden border-y border-slate-200 bg-white">
              <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-slate-900">
                    {isHrMarathon ? 'HR ' : ''}Week {selectedWeek.weekIndex}: {selectedWeek.phase}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{selectedWeek.rangeLabel}</p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <label className="text-xs font-semibold text-slate-500">
                    Start date
                    <span className="mt-1 flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2">
                      <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      <input
                        type="date"
                        value={activeStartDate}
                        onChange={(event) => setActiveStartDate(event.target.value)}
                        className="h-7 min-w-0 bg-transparent text-sm font-medium text-slate-800 outline-none"
                      />
                    </span>
                  </label>
                  <div className="text-xs text-slate-500">
                    {activeTrainingSummary.completedWorkouts}/{activeTrainingSummary.totalWorkouts} complete
                  </div>
                </div>
              </div>
              <div className="hidden grid-cols-[2.5rem_5rem_minmax(0,1fr)_8rem_5rem_5rem] gap-3 border-b border-slate-100 bg-white px-5 py-2 text-xs font-black uppercase tracking-wide text-slate-400 sm:grid">
                <span />
                <span>Date</span>
                <span>Session</span>
                <span>Distance</span>
                <span>Type</span>
                <span>Recovery</span>
              </div>
              <div>
                {selectedWeek.workouts.map((workout) => (
                  <WorkoutAgendaRow
                    key={workout.id}
                    workout={workout}
                    progress={tracker.state.marathonProgressByWorkoutId[workout.id]}
                    selected={activeWorkoutId === workout.id}
                    onToggleComplete={() => tracker.toggleWorkoutCompletion(workout.id)}
                    onOpenDetails={() => setActiveWorkoutId(workout.id)}
                  />
                ))}
              </div>
            </div>

            {activeWorkout && (
              <WorkoutDetailDrawer
                workout={activeWorkout}
                progress={tracker.state.marathonProgressByWorkoutId[activeWorkout.id]}
                onClose={() => setActiveWorkoutId(null)}
                onToggleComplete={() => tracker.toggleWorkoutCompletion(activeWorkout.id)}
                onSetActualPace={(value) => tracker.setActualPace(activeWorkout.id, value)}
                onSetNotes={(value) => tracker.setWorkoutNotes(activeWorkout.id, value)}
                onSetRecoverySignal={(value) => tracker.setRecoverySignal(activeWorkout.id, value)}
                onAddSplit={() => tracker.addSplit(activeWorkout.id)}
                onUpdateSplit={(splitIndex, field, value) => tracker.updateSplit(activeWorkout.id, splitIndex, field, value)}
                onRemoveSplit={(splitIndex) => tracker.removeSplit(activeWorkout.id, splitIndex)}
              />
            )}
          </section>
        )}

        {tracker.state.settings.activeTab === 'dsa' && (
          <section className="space-y-5">
            <div className="border-y border-slate-200 bg-slate-900 px-5 py-6 text-white sm:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <CodeIcon className="h-6 w-6 text-blue-300" />
                    <h2 className="text-2xl font-black tracking-tight">Job Prep: DSA Queue</h2>
                  </div>
                  <p className="mt-3 text-base font-medium text-slate-400">
                    {tracker.dsaSummary.completedProblems}/{tracker.dsaSummary.totalProblems} complete across {tracker.dsaWeeks.length} weeks.
                  </p>
                </div>
                {nextDsaItem ? (
                  <div className="min-w-0 border-t border-slate-700 pt-4 sm:w-80 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                    <p className="text-xs font-black uppercase tracking-wide text-blue-300">Next problem</p>
                    <p className="mt-1 truncate text-sm font-black text-white">{nextDsaItem.problem.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Week {nextDsaItem.week.weekIndex} · {nextDsaItem.week.topic}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="overflow-hidden border-y border-slate-200 bg-white">
              {tracker.dsaWeeks.map((week) => (
                <DsaWeekCard
                  key={week.weekIndex}
                  week={week}
                  progressByProblemId={tracker.state.dsaProgressByProblemId}
                  onToggleProblem={tracker.toggleDsaProblemCompletion}
                  onSetProblemNotes={tracker.setDsaProblemNotes}
                />
              ))}
            </div>
          </section>
        )}

        {tracker.state.settings.activeTab === 'reference' && <ReferenceView />}

        {tracker.state.settings.activeTab === 'settings' && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                <SettingsIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-950">Settings</h2>
                <p className="mt-1 text-sm text-slate-500">Local-first persistence. Firebase is optional.</p>
              </div>
            </div>
            <div className="space-y-5 p-5">
              <label className="block max-w-xs text-sm font-semibold text-slate-700">
                Original 16-week start date
                <input
                  type="date"
                  value={tracker.state.settings.marathonStartDate}
                  onChange={(event) => tracker.setMarathonStartDate(event.target.value)}
                  className="mt-1 block h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>
              <label className="block max-w-xs text-sm font-semibold text-slate-700">
                HR 18-week start date
                <input
                  type="date"
                  value={tracker.state.settings.hrMarathonStartDate}
                  onChange={(event) => tracker.setHrMarathonStartDate(event.target.value)}
                  className="mt-1 block h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>
              <p className="text-sm text-slate-500">Active plan race day currently derives as {raceDate ? formatLongDate(raceDate) : 'not available'}.</p>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <BellIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-950">Daily reminders</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          A foreground reminder appears in the app. Browser notifications are optional and depend on OS settings.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleTestNotification()}
                        className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-white px-3 text-sm font-bold text-blue-700 ring-1 ring-slate-200 transition hover:bg-blue-50"
                      >
                        Send test
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_10rem]">
                      <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                        <input
                          type="checkbox"
                          checked={tracker.state.settings.notificationEnabled}
                          onChange={(event) => void handleNotificationEnabledChange(event.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        <span className="min-w-0">
                          <span className="block font-semibold text-slate-800">Enable daily app reminder</span>
                          <span className="block text-slate-500">{notificationPermissionText}</span>
                        </span>
                      </label>

                      <label className="block text-sm font-semibold text-slate-700">
                        Reminder time
                        <input
                          type="time"
                          value={tracker.state.settings.notificationTime}
                          onChange={(event) => tracker.setNotificationTime(event.target.value)}
                          className="mt-1 block h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                        />
                      </label>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <label className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                        <input
                          type="checkbox"
                          checked={tracker.state.settings.notifyMarathon}
                          onChange={(event) => tracker.setNotifyMarathon(event.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        Marathon workout
                      </label>
                      <label className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                        <input
                          type="checkbox"
                          checked={tracker.state.settings.notifyDsa}
                          onChange={(event) => tracker.setNotifyDsa(event.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        DSA problem
                      </label>
                    </div>

                    {dailyReminderPayload && (
                      <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                        <span className="block font-bold">Today&apos;s reminder preview</span>
                        <span className="mt-1 block whitespace-pre-line">{dailyReminderPayload.body}</span>
                      </div>
                    )}

                    {notificationMessage && (
                      <p className="mt-3 text-sm font-semibold text-slate-600">{notificationMessage}</p>
                    )}
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <input
                  type="checkbox"
                  checked={tracker.state.settings.firebaseSyncEnabled}
                  onChange={(event) => tracker.setFirebaseSyncEnabled(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-800">Enable Firebase sync</span>
                  <span className="block break-words text-slate-500">{tracker.syncStatus.message}</span>
                </span>
              </label>
            </div>
          </section>
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        button, input, select, textarea { font: inherit; }
        .hide-scrollbar { scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.45); border-radius: 999px; }
      `}</style>
    </div>
  );
}
