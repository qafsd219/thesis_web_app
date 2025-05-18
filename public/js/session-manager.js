import {
  auth,
  setPersistence,
  browserSessionPersistence,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
} from "./firebase-config.js";
import { logEvent } from "./logger.js";

// Enable session persistence
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Session persistence enabled");
  })
  .catch((error) => {
    console.error("Error setting session persistence:", error);
  });

// Redirect if user is not authenticated
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    console.log("User is authenticated:", user.email);
    startInactivityTracking();
  }
});

// Auto logout after 10 minutes of inactivity
let inactivityTimeout;

function startInactivityTracking() {
  const resetTimer = () => {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const name = userDoc.exists() ? userDoc.data().name : "Unknown";

          await logEvent("Logout", `${name} was logged out due to inactivity.`);

          localStorage.removeItem("loggedInUserID");
          alert("You were logged out due to inactivity.");
          await signOut(auth);
          window.location.href = "index.html";
        } catch (error) {
          console.error("Error during auto logout:", error);
        }
      }
    }, 600000); // 10 minutes
  };

  ["mousemove", "keydown", "click", "scroll"].forEach((event) =>
    window.addEventListener(event, resetTimer)
  );

  resetTimer(); // Start the timer immediately
}

