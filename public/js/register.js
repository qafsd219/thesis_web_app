import {
  auth,
  db,
  createUserWithEmailAndPassword,
  doc,
  setDoc,
  getDoc
} from "./firebase-config.js";
import { logEvent } from "./logger.js";

document.addEventListener("DOMContentLoaded", () => {
  const signUpBtn = document.getElementById("signUpBtn");
  const confirmRegisterBtn = document.getElementById("confirmRegisterBtn");
  const consentCheckbox = document.getElementById("consentCheckbox");

  const privacyModalElement = document.getElementById("privacyModal");
  const privacyModal = new bootstrap.Modal(privacyModalElement);

  // Show modal when "Sign Up" button is clicked
  if (signUpBtn) {
    signUpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      privacyModal.show();
    });
  }

  // Handle Confirm Registration inside modal
  if (confirmRegisterBtn) {
    confirmRegisterBtn.addEventListener("click", async () => {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!consentCheckbox.checked) {
        alert("You must agree to the Data Privacy Consent to register.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      if (!name || !email || !password) {
        alert("All fields are required!");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          completedSessions: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.uid,
          role: "user",
          totalPoints: 0,
          currentPoints: 0,
        });

        alert("User registered successfully!");
        privacyModal.hide();
        console.log("User created:", user);

        // Fetch user role and redirect
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const userRole = userData.role;
          localStorage.setItem("loggedInUserID", user.uid);

          if (userRole === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "user.html";
          }
        } else {
          alert("User data not found.");
        }
        await logEvent("Register", `${name} successfully registered.`);
      } catch (error) {
        console.error(error.code, error.message);
        alert(error.message);
        await logEvent("Register", `${name} registration failed: ${error.message}`);
      }
    });
  }
});
