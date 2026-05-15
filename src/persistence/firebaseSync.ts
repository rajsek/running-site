import { hydrateTrackerState } from './localStore';
import type { FirebaseSyncStatus, TrackerState } from '../types';

type OnRemoteState = (state: TrackerState) => void;
type OnStatus = (status: FirebaseSyncStatus) => void;

interface FirebaseController {
  save: (state: TrackerState) => Promise<void>;
  dispose: () => void;
}

interface FirebaseUserLike {
  uid: string;
}

interface FirestoreSnapshotLike {
  exists: () => boolean;
  data: () => unknown;
}

const getGlobalValue = (name: string): unknown => (globalThis as Record<string, unknown>)[name];

const readFirebaseConfig = (): Record<string, unknown> | undefined => {
  const raw = getGlobalValue('__firebase_config');
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : undefined;
};

const runtimeImport = async <T,>(specifier: string): Promise<T> => {
  const importer = new Function('specifier', 'return import(specifier)') as (value: string) => Promise<T>;
  return importer(specifier);
};

export const startFirebaseSync = async (
  getState: () => TrackerState,
  onRemoteState: OnRemoteState,
  onStatus: OnStatus,
): Promise<FirebaseController | undefined> => {
  const config = readFirebaseConfig();
  if (!config || Object.keys(config).length === 0) {
    onStatus({ mode: 'disabled', message: 'Firebase config not found. Using local storage.' });
    return undefined;
  }

  onStatus({ mode: 'connecting', message: 'Connecting to Firebase...' });

  try {
    const [{ initializeApp }, authModule, firestoreModule] = await Promise.all([
      runtimeImport<Record<string, any>>('firebase/app'),
      runtimeImport<Record<string, any>>('firebase/auth'),
      runtimeImport<Record<string, any>>('firebase/firestore'),
    ]);

    const app = initializeApp(config);
    const auth = authModule.getAuth(app);
    const db = firestoreModule.getFirestore(app);
    const appId = String(getGlobalValue('__app_id') || 'training-dashboard');
    const initialAuthToken = getGlobalValue('__initial_auth_token');

    if (typeof initialAuthToken === 'string' && initialAuthToken) {
      await authModule.signInWithCustomToken(auth, initialAuthToken);
    } else {
      await authModule.signInAnonymously(auth);
    }

    let unsubscribeSnapshot: (() => void) | undefined;
    let docRef: any;

    const unsubscribeAuth = authModule.onAuthStateChanged(auth, (user: FirebaseUserLike | null) => {
      if (!user) return;
      docRef = firestoreModule.doc(db, 'artifacts', appId, 'users', user.uid, 'tracker', 'mainData');
      unsubscribeSnapshot = firestoreModule.onSnapshot(
        docRef,
        (snapshot: FirestoreSnapshotLike) => {
          if (!snapshot.exists()) {
            void firestoreModule.setDoc(docRef!, getState(), { merge: true });
            return;
          }
          onRemoteState(hydrateTrackerState(snapshot.data()));
        },
        () => {
          onStatus({ mode: 'error', message: 'Firebase snapshot failed. Local storage is still active.' });
        },
      );
      onStatus({ mode: 'ready', message: 'Firebase sync connected.' });
    });

    return {
      save: async (state: TrackerState) => {
        if (!docRef) return;
        await firestoreModule.setDoc(
          docRef,
          {
            ...state,
            sync: {
              ...state.sync,
              lastRemoteSaveAtIso: new Date().toISOString(),
            },
          },
          { merge: true },
        );
      },
      dispose: () => {
        unsubscribeSnapshot?.();
        unsubscribeAuth();
      },
    };
  } catch {
    onStatus({ mode: 'error', message: 'Firebase is unavailable. Core tracking remains local.' });
    return undefined;
  }
};
