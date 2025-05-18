import {
  db,
  auth,
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  onAuthStateChanged
} from "./firebase-config.js";

export async function logEvent(event, details) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      let name = "Unknown user";

      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            name = userDocSnap.data().name || "Unnamed user";
          }
        } catch (error) {
          console.error("Failed to fetch user name for logging:", error);
        }
      }

      try {
        await addDoc(collection(db, "logs"), {
          user: name,
          event,
          details,
          timestamp: serverTimestamp(),
        });
        resolve();
      } catch (error) {
        console.error("Failed to log event:", error);
        resolve();
      }
    });
  });
}
