import { initializeApp, getApps } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  query,
  orderByChild,
  limitToLast,
  onValue,
  off,
  type DatabaseReference,
  type Query,
} from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

export const db = getDatabase(firebaseApp);

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  sound?: string;
  createdAt: number;
  read: boolean;
}

export async function saveNotificationToFirebase(
  notification: Omit<NotificationRecord, "id">
): Promise<string> {
  const notificationsRef = ref(db, "notifications");
  const result = await push(notificationsRef, notification);
  return result.key ?? "";
}

export function subscribeToNotifications(
  limit: number,
  callback: (notifications: NotificationRecord[]) => void
): () => void {
  const notificationsRef = ref(db, "notifications");
  const q: Query = query(
    notificationsRef,
    orderByChild("createdAt"),
    limitToLast(limit)
  );

  const handler = onValue(q, (snapshot) => {
    const items: NotificationRecord[] = [];
    snapshot.forEach((child) => {
      items.push({ id: child.key!, ...(child.val() as Omit<NotificationRecord, "id">) });
    });
    items.sort((a, b) => b.createdAt - a.createdAt);
    callback(items);
  });

  return () => off(q, "value", handler);
}

export { ref, push, db as firebaseDb };
