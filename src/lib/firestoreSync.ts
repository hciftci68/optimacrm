import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export function cleanForFirestore(obj: any): any {
  if (obj === undefined) {
    return null;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanForFirestore(item));
  }
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = cleanForFirestore(val);
    }
  }
  return cleaned;
}

export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  initialData: T[],
  onData: (items: T[]) => void
) {
  const colRef = collection(db, collectionName);
  const unsubscribe = onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty && initialData.length > 0) {
        // Seed initial data to Firestore
        try {
          for (const item of initialData) {
            await setDoc(doc(db, collectionName, item.id), cleanForFirestore(item));
          }
        } catch (err) {
          console.warn(`Failed seeding ${collectionName}:`, err);
        }
      } else {
        const items = snapshot.docs.map((d) => d.data() as T);
        if (items.length > 0) {
          onData(items);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionName);
    }
  );
  return unsubscribe;
}

export async function saveToFirestore<T extends { id: string }>(
  collectionName: string,
  item: T,
  userRef?: { name?: string; email?: string }
) {
  const now = new Date().toISOString();
  const userName = userRef?.name ? `${userRef.name} (${userRef.email || ''})` : (userRef?.email || 'System User');
  const itemObj = item as Record<string, any>;

  const auditData = {
    ...itemObj,
    createdUser: itemObj.createdUser || userName,
    createdDateTime: itemObj.createdDateTime || itemObj.createdAt || now,
    lastModifiedUser: userName,
    lastModifiedDateTime: now,
  };

  try {
    await setDoc(doc(db, collectionName, item.id), cleanForFirestore(auditData));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

export async function updateInFirestore(
  collectionName: string,
  id: string,
  updates: Record<string, any>,
  userRef?: { name?: string; email?: string }
) {
  const now = new Date().toISOString();
  const userName = userRef?.name ? `${userRef.name} (${userRef.email || ''})` : (userRef?.email || 'System User');

  const auditUpdates = {
    ...updates,
    lastModifiedUser: userName,
    lastModifiedDateTime: now,
  };

  try {
    await setDoc(doc(db, collectionName, id), cleanForFirestore(auditUpdates), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
  }
}

export async function deleteFromFirestore(collectionName: string, id: string) {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}
