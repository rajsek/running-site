import { dsaPlanTemplate } from '../data/dsaPlanTemplate';
import { formatDistance } from './schedule';
import type { DerivedMarathonWeek, ISODate, TrackerSettings, TrackerState } from '../types';

export type BrowserNotificationPermission = NotificationPermission | 'unsupported';

export interface DailyReminderPayload {
  title: string;
  body: string;
  todayIso: ISODate;
}

export interface NotificationDeliveryResult {
  browserShown: boolean;
  reason?: string;
}

export const getLocalIsoDate = (date = new Date()): ISODate => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getBrowserNotificationPermission = (): BrowserNotificationPermission => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

export const requestBrowserNotificationPermission = async (): Promise<BrowserNotificationPermission> => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.requestPermission();
};

const parseNotificationTime = (value: string): number => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return 7 * 60;
  return Number(match[1]) * 60 + Number(match[2]);
};

export const isDailyReminderDue = (settings: TrackerSettings, now = new Date()): boolean => {
  if (!settings.notificationEnabled) return false;
  const todayIso = getLocalIsoDate(now);
  if (settings.lastNotificationDate === todayIso) return false;

  const dueMinutes = parseNotificationTime(settings.notificationTime);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= dueMinutes;
};

export const buildDailyReminderPayload = (
  state: TrackerState,
  marathonWeeks: DerivedMarathonWeek[],
  todayIso = getLocalIsoDate(),
): DailyReminderPayload | null => {
  const lines: string[] = [];

  if (state.settings.notifyMarathon) {
    const workout = marathonWeeks.flatMap((week) => week.workouts).find((item) => item.date === todayIso);
    if (workout) {
      const distance = formatDistance(workout);
      lines.push(`Marathon: ${workout.title}${distance ? ` (${distance})` : ''}.`);
    }
  }

  if (state.settings.notifyDsa) {
    const activeWeek = dsaPlanTemplate.find((week) =>
      week.problems.some((problem) => !state.dsaProgressByProblemId[problem.id]?.completed),
    );
    const nextProblem = activeWeek?.problems.find((problem) => !state.dsaProgressByProblemId[problem.id]?.completed);
    if (activeWeek && nextProblem) {
      lines.push(`DSA: Week ${activeWeek.weekIndex} ${activeWeek.topic} - ${nextProblem.name}.`);
    }
  }

  if (lines.length === 0) return null;

  return {
    title: 'Training reminder',
    body: lines.join('\n'),
    todayIso,
  };
};

export const showBrowserNotification = async (
  payload: Pick<DailyReminderPayload, 'title' | 'body'>,
): Promise<NotificationDeliveryResult> => {
  if (getBrowserNotificationPermission() !== 'granted') {
    return { browserShown: false, reason: 'permission-not-granted' };
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<ServiceWorkerRegistration | null>((resolve) => {
          window.setTimeout(() => resolve(null), 1200);
        }),
      ]);

      if (registration) {
        await registration.showNotification(payload.title, {
          body: payload.body,
          tag: 'running-site-daily-training',
        });
        return { browserShown: true };
      }
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      tag: 'running-site-daily-training',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return { browserShown: true };
  } catch (error) {
    return {
      browserShown: false,
      reason: error instanceof Error ? error.message : 'notification-failed',
    };
  }
};
