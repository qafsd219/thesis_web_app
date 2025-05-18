import {
  auth,
  db,
  signInWithEmailAndPassword,
  doc,
  getDoc
} from "./firebase-config.js";
import { logEvent } from "./logger.js";

// LOG IN
const signIn = document.getElementById("signInBtn");
signIn.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed in:", user.uid);
    localStorage.setItem("loggedInUserID", user.uid);

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const { role, name } = userDocSnap.data();

      await logEvent("User Login", `${name} logged in successfully.`);

      if (role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "user.html";
      }
    } else {
      alert("User data not found.");
    }
  } catch (error) {
    console.error(error.code, error.message);
    alert("Invalid email or password.");
  }
});
