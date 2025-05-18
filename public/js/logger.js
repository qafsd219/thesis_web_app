import { db, auth, collection, addDoc, serverTimestamp } from "./firebase-config.js";

export async function logEvent(event, details) {
  const user = auth.currentUser;
  const name = user?.displayName || "Unknown user";

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
  } catch (error) {
    console.error("Failed to log event:", error);
  }
}
