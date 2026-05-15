import { useEffect, useMemo, useRef, useState } from 'react';
import { dsaPlanTemplate } from '../data/dsaPlanTemplate';
import { hrMarathonPlanTemplate, phaseForHrWeek } from '../data/hrMarathonPlanTemplate';
import { marathonPlanTemplate } from '../data/marathonPlanTemplate';
import {
  addSplit,
  removeSplit,
  setActualPace,
  setDsaProblemNotes,
  setRecoverySignal,
  setWorkoutNotes,
  toggleDsaProblemCompletion,
  toggleWorkoutCompletion,
  updateSplit,
} from '../domain/progress';
import { deriveMarathonWeeks, summarizeMarathon } from '../domain/schedule';
import { startFirebaseSync } from '../persistence/firebaseSync';
import { hydrateTrackerState, mergeTrackerState, readTrackerState, writeTrackerState } from '../persistence/localStore';
import type { AppTab, FirebaseSyncStatus, RecoverySignal, SplitRecord, TrackerState } from '../types';

export const useTrainingTracker = () => {
  const [state, setState] = useState<TrackerState>(() => readTrackerState());
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [syncStatus, setSyncStatus] = useState<FirebaseSyncStatus>({
    mode: 'disabled',
    message: 'Firebase sync is off. Using local storage.',
  });
  const firebaseControllerRef = useRef<{ save: (state: TrackerState) => Promise<void>; dispose: () => void }>();
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    writeTrackerState(state);
    if (state.settings.firebaseSyncEnabled) {
      void firebaseControllerRef.current?.save(state);
    }
  }, [state]);

  useEffect(() => {
    let disposed = false;

    if (!state.settings.firebaseSyncEnabled) {
      firebaseControllerRef.current?.dispose();
      firebaseControllerRef.current = undefined;
      setSyncStatus({ mode: 'disabled', message: 'Firebase sync is off. Using local storage.' });
      return;
    }

    void startFirebaseSync(
      () => stateRef.current,
      (remoteState) => {
        if (disposed) return;
        setState((current) => mergeTrackerState(current, hydrateTrackerState(remoteState)));
      },
      (status) => {
        if (!disposed) setSyncStatus(status);
      },
    ).then((controller) => {
      if (disposed) {
        controller?.dispose();
        return;
      }
      firebaseControllerRef.current = controller;
    });

    return () => {
      disposed = true;
      firebaseControllerRef.current?.dispose();
      firebaseControllerRef.current = undefined;
    };
  }, [state.settings.firebaseSyncEnabled]);

  const marathonWeeks = useMemo(
    () => deriveMarathonWeeks(state.settings.marathonStartDate, marathonPlanTemplate),
    [state.settings.marathonStartDate],
  );

  const marathonSummary = useMemo(
    () => summarizeMarathon(marathonWeeks, state.marathonProgressByWorkoutId),
    [marathonWeeks, state.marathonProgressByWorkoutId],
  );

  const hrMarathonWeeks = useMemo(
    () => deriveMarathonWeeks(state.settings.hrMarathonStartDate, hrMarathonPlanTemplate, phaseForHrWeek),
    [state.settings.hrMarathonStartDate],
  );

  const hrMarathonSummary = useMemo(
    () => summarizeMarathon(hrMarathonWeeks, state.marathonProgressByWorkoutId),
    [hrMarathonWeeks, state.marathonProgressByWorkoutId],
  );

  const dsaSummary = useMemo(() => {
    const totalProblems = dsaPlanTemplate.reduce((sum, week) => sum + week.problems.length, 0);
    const completedProblems = dsaPlanTemplate.reduce(
      (sum, week) => sum + week.problems.filter((problem) => state.dsaProgressByProblemId[problem.id]?.completed).length,
      0,
    );
    const activeWeek = dsaPlanTemplate.find((week) =>
      week.problems.some((problem) => !state.dsaProgressByProblemId[problem.id]?.completed),
    );
    return {
      totalProblems,
      completedProblems,
      activeWeekIndex: activeWeek?.weekIndex ?? dsaPlanTemplate[dsaPlanTemplate.length - 1].weekIndex,
    };
  }, [state.dsaProgressByProblemId]);

  const setActiveTab = (activeTab: AppTab) =>
    setState((current) => ({
      ...current,
      settings: { ...current.settings, activeTab },
    }));

  const setMarathonStartDate = (marathonStartDate: string) =>
    setState((current) => ({
      ...current,
      settings: { ...current.settings, marathonStartDate },
    }));

  const setHrMarathonStartDate = (hrMarathonStartDate: string) =>
    setState((current) => ({
      ...current,
      settings: { ...current.settings, hrMarathonStartDate },
    }));

  const setFirebaseSyncEnabled = (firebaseSyncEnabled: boolean) =>
    setState((current) => ({
      ...current,
      settings: { ...current.settings, firebaseSyncEnabled },
    }));

  const setNotificationEnabled = (notificationEnabled: boolean) =>
    setState((current) => ({
      ...current,
      settings: { ...current.settings, notificationEnabled },
    }));

  const setNotificationTime = (notificationTime: string) =>
    setState((current) => ({
      ...current,
      settings: { ...current.settings, notificationTime },
    }));

  const setNotifyMarathon = (notifyMarathon: boolean) =>
    setState((current) => ({
      ...current,
      settings: { ...current.settings, notifyMarathon },
    }));

  const setNotifyDsa = (notifyDsa: boolean) =>
    setState((current) => ({
      ...current,
      settings: { ...current.settings, notifyDsa },
    }));

  const setLastNotificationDate = (lastNotificationDate: string) =>
    setState((current) => ({
      ...current,
      settings: { ...current.settings, lastNotificationDate },
    }));

  const importState = (value: unknown) => {
    setState((current) => mergeTrackerState(current, hydrateTrackerState(value)));
  };

  const resetState = () => {
    setState(readTrackerState());
  };

  return {
    state,
    setState,
    selectedWeek,
    setSelectedWeek,
    marathonWeeks,
    marathonSummary,
    hrMarathonWeeks,
    hrMarathonSummary,
    dsaWeeks: dsaPlanTemplate,
    dsaSummary,
    syncStatus,
    setActiveTab,
    setMarathonStartDate,
    setHrMarathonStartDate,
    setFirebaseSyncEnabled,
    setNotificationEnabled,
    setNotificationTime,
    setNotifyMarathon,
    setNotifyDsa,
    setLastNotificationDate,
    importState,
    resetState,
    toggleWorkoutCompletion: (workoutId: string) =>
      setState((current) => toggleWorkoutCompletion(current, workoutId)),
    setActualPace: (workoutId: string, actualPace: string) =>
      setState((current) => setActualPace(current, workoutId, actualPace)),
    setWorkoutNotes: (workoutId: string, notes: string) =>
      setState((current) => setWorkoutNotes(current, workoutId, notes)),
    setRecoverySignal: (workoutId: string, recoverySignal: RecoverySignal) =>
      setState((current) => setRecoverySignal(current, workoutId, recoverySignal)),
    addSplit: (workoutId: string) => setState((current) => addSplit(current, workoutId)),
    updateSplit: (workoutId: string, splitIndex: number, field: keyof SplitRecord, value: string) =>
      setState((current) => updateSplit(current, workoutId, splitIndex, field, value)),
    removeSplit: (workoutId: string, splitIndex: number) =>
      setState((current) => removeSplit(current, workoutId, splitIndex)),
    toggleDsaProblemCompletion: (problemId: string) =>
      setState((current) => toggleDsaProblemCompletion(current, problemId)),
    setDsaProblemNotes: (problemId: string, notes: string) =>
      setState((current) => setDsaProblemNotes(current, problemId, notes)),
  };
};
