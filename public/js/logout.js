import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from "./firebase-config.js";
import { logEvent } from "./logger.js";

// LOGOUT FUNCTION
async function logout() {
  const isConfirmed = confirm("Are you sure you want to log out?");
  if (!isConfirmed) {
    console.log("Log out cancelled.");
    return;
  }

  const user = auth.currentUser;
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const name = userDoc.exists() ? userDoc.data().name : "Unknown";

      // Log the logout event
      await addDoc(collection(db, "logs"), {
        user: name,
        event: "Logout",
        details: `${name} logged out manually.`,
        timestamp: serverTimestamp()
      });

      await signOut(auth);
      localStorage.removeItem("loggedInUserID");
      console.log("User signed out successfully!");
      window.location.href = "index.html";

    } catch (error) {
      console.error("Error during manual logout:", error);
    }
  }
}

// DOM READY
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });

    // Show/hide logout button based on auth state
    onAuthStateChanged(auth, (user) => {
      logoutBtn.style.display = user ? "inline-block" : "none";
    });
  } else {
    console.warn("logoutBtn not found");
  }
});
