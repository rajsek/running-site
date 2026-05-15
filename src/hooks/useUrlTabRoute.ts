import { useCallback, useEffect, useRef } from 'react';
import type { AppTab } from '../types';

const routeByTab: Record<AppTab, string> = {
  marathon: 'marathon',
  hrMarathon: 'hr',
  dsa: 'dsa',
  reference: 'pace',
  settings: 'settings',
};

const tabByRoute: Record<string, AppTab> = {
  marathon: 'marathon',
  hr: 'hrMarathon',
  hrmarathon: 'hrMarathon',
  dsa: 'dsa',
  pace: 'reference',
  reference: 'reference',
  settings: 'settings',
};

interface ParsedRoute {
  tab?: AppTab;
  weekIndex?: number;
}

const tabToHash = (tab: AppTab, selectedWeek: number): string => {
  if (tab === 'marathon') return `#/marathon/week/${selectedWeek}`;
  if (tab === 'hrMarathon') return `#/hr/week/${selectedWeek}`;
  return `#/${routeByTab[tab]}`;
};

const parseHash = (): ParsedRoute => {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const tab = tabByRoute[parts[0]];
  const parsedWeekIndex = ['marathon', 'hr', 'hrmarathon'].includes(parts[0]) && parts[1] === 'week' ? Number(parts[2]) : undefined;
  return {
    tab,
    weekIndex: parsedWeekIndex !== undefined && Number.isInteger(parsedWeekIndex) && parsedWeekIndex > 0 ? parsedWeekIndex : undefined,
  };
};

export const useUrlTabRoute = (
  activeTab: AppTab,
  setActiveTab: (tab: AppTab) => void,
  selectedWeek: number,
  setSelectedWeek: (weekIndex: number) => void,
) => {
  const setActiveTabRef = useRef(setActiveTab);
  const setSelectedWeekRef = useRef(setSelectedWeek);
  const selectedWeekRef = useRef(selectedWeek);

  useEffect(() => {
    setActiveTabRef.current = setActiveTab;
    setSelectedWeekRef.current = setSelectedWeek;
    selectedWeekRef.current = selectedWeek;
  }, [selectedWeek, setActiveTab, setSelectedWeek]);

  useEffect(() => {
    const syncFromUrl = () => {
      const route = parseHash();
      if (route.tab) setActiveTabRef.current(route.tab);
      if (route.weekIndex) setSelectedWeekRef.current(route.weekIndex);
    };

    syncFromUrl();
    window.addEventListener('hashchange', syncFromUrl);
    window.addEventListener('popstate', syncFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncFromUrl);
      window.removeEventListener('popstate', syncFromUrl);
    };
  }, []);

  useEffect(() => {
    const route = parseHash();
    if (route.tab && route.tab !== activeTab) return;
    if ((activeTab === 'marathon' || activeTab === 'hrMarathon') && route.weekIndex && route.weekIndex !== selectedWeek) return;
    const nextHash = tabToHash(activeTab, selectedWeek);
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
  }, [activeTab, selectedWeek]);

  const navigateTab = useCallback((tab: AppTab) => {
    const nextHash = tabToHash(tab, selectedWeekRef.current);
    if (window.location.hash !== nextHash) window.location.hash = nextHash;
    setActiveTabRef.current(tab);
  }, []);

  const navigateWeek = useCallback((weekIndex: number, tab: AppTab = 'marathon') => {
    const nextHash = tabToHash(tab, weekIndex);
    if (window.location.hash !== nextHash) window.location.hash = nextHash;
    setSelectedWeekRef.current(weekIndex);
  }, []);

  return { navigateTab, navigateWeek };
};
