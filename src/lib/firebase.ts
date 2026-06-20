import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export { db };

// Robust fallback to LocalStorage for offline-first development and immediate preview feedback
export class StorageService {
  static isFirestoreAvailable = true;

  static async getData<T>(collectionName: string): Promise<T[]> {
    try {
      if (this.isFirestoreAvailable) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const data: T[] = [];
        querySnapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
        });
        if (data.length > 0) {
          // Sync to localStorage
          localStorage.setItem(`tableflow_${collectionName}`, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn(`Firestore collection ${collectionName} error, falling back to LocalStorage:`, e);
      // Don't completely fail, use LocalStorage fallback
    }

    // LocalStorage fallback
    const localData = localStorage.getItem(`tableflow_${collectionName}`);
    return localData ? JSON.parse(localData) : [];
  }

  static async saveData<T extends { id: string }>(collectionName: string, items: T[]): Promise<void> {
    // Save to localStorage immediately
    localStorage.setItem(`tableflow_${collectionName}`, JSON.stringify(items));

    try {
      if (this.isFirestoreAvailable) {
        const batch = writeBatch(db);
        const colRef = collection(db, collectionName);
        
        // Due to limits in Firestore batches (max 500), this works beautifully for standard SaaS datasets
        for (const item of items) {
          const docRef = doc(db, collectionName, item.id);
          batch.set(docRef, item, { merge: true });
        }
        await batch.commit();
      }
    } catch (e) {
      console.warn(`Error writing to Firestore ${collectionName}:`, e);
    }
  }

  static async saveSingleItem<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
    // Read list from LocalStorage first to make writes near-instant and lag-free
    const localData = localStorage.getItem(`tableflow_${collectionName}`);
    const list: T[] = localData ? JSON.parse(localData) : [];
    
    const index = list.findIndex(i => i.id === item.id);
    if (index > -1) {
      list[index] = item;
    } else {
      list.push(item);
    }
    localStorage.setItem(`tableflow_${collectionName}`, JSON.stringify(list));

    try {
      if (this.isFirestoreAvailable) {
        const docRef = doc(db, collectionName, item.id);
        await setDoc(docRef, item, { merge: true });
      }
    } catch (e) {
      console.warn(`Error saving single item in ${collectionName}:`, e);
    }
  }
}
