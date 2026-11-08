import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { loadAllAppData, saveAllAppData } from './storage';

export type SyncStatus = 'connected' | 'syncing' | 'offline' | 'error';

// Unique ID for this browser tab/device to avoid echo loops
export const DEVICE_SESSION_ID =
  'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

const ERP_DOC_PATH = 'erp_state';
const ERP_DOC_ID = 'current_state';

let isApplyingRemoteChange = false;
let syncStatusListener: ((status: SyncStatus, lastSyncTime?: string) => void) | null = null;

export function registerSyncStatusListener(
  callback: (status: SyncStatus, lastSyncTime?: string) => void
) {
  syncStatusListener = callback;
}

/**
 * Initialize real-time synchronization between Mobile and PC via Cloud Firestore
 */
export function initRealtimeCloudSync(onRemoteDataReceived: () => void) {
  try {
    const docRef = doc(db, ERP_DOC_PATH, ERP_DOC_ID);

    // Initial check or seed if doc doesn't exist
    getDoc(docRef)
      .then((snap) => {
        if (!snap.exists()) {
          // First time initialization in Cloud Firestore
          const initialData = loadAllAppData();
          pushStateToCloud(initialData);
        }
      })
      .catch((err) => {
        console.warn('Initial cloud read notice:', err);
      });

    // Real-time listener for multi-device sync
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          // If the change was made by another device (e.g. Mobile updating PC or vice-versa)
          if (remoteData && remoteData.lastUpdatedBy !== DEVICE_SESSION_ID) {
            try {
              if (remoteData.payload) {
                const parsed = JSON.parse(remoteData.payload);
                isApplyingRemoteChange = true;
                saveAllAppData(parsed);
                onRemoteDataReceived();
                isApplyingRemoteChange = false;

                if (syncStatusListener) {
                  syncStatusListener(
                    'connected',
                    remoteData.updatedAtBS || new Date().toLocaleTimeString()
                  );
                }
              }
            } catch (parseErr) {
              console.error('Failed to parse remote cloud payload:', parseErr);
            }
          } else {
            if (syncStatusListener) {
              syncStatusListener('connected', new Date().toLocaleTimeString());
            }
          }
        }
      },
      (error) => {
        console.error('Real-time cloud sync listener error:', error);
        if (syncStatusListener) {
          syncStatusListener('offline');
        }
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to start real-time cloud sync:', err);
    if (syncStatusListener) {
      syncStatusListener('offline');
    }
    return () => {};
  }
}

/**
 * Push current app state to Cloud Firestore so all mobile/desktop devices update instantly
 */
export async function pushStateToCloud(data: ReturnType<typeof loadAllAppData>) {
  if (isApplyingRemoteChange) return;

  try {
    if (syncStatusListener) {
      syncStatusListener('syncing');
    }

    const docRef = doc(db, ERP_DOC_PATH, ERP_DOC_ID);
    const jsonString = JSON.stringify(data);

    await setDoc(
      docRef,
      {
        id: ERP_DOC_ID,
        payload: jsonString,
        lastUpdatedBy: DEVICE_SESSION_ID,
        updatedAt: new Date().toISOString(),
        updatedAtBS: data.settings?.currentSystemDateBS || '',
      },
      { merge: true }
    );

    if (syncStatusListener) {
      syncStatusListener('connected', new Date().toLocaleTimeString());
    }
  } catch (error) {
    console.error('Error broadcasting update to cloud:', error);
    if (syncStatusListener) {
      syncStatusListener('error');
    }
  }
}
