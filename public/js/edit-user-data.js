import {
  auth,
  db,
  doc,
  updateDoc,
  updateEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "./firebase-config.js";

import { logEvent } from "./logger.js";

const nameInput = document.getElementById("userName");
const emailInput = document.getElementById("userEmail");
const passwordInput = document.getElementById("userPassword");
const confirmNewPasswordInput = document.getElementById("confirmNewPassword");

const editBtn = document.getElementById("editProfileBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const passwordSection = document.getElementById("passwordSection");
const changePasswordBtn = document.getElementById("changePasswordBtn");

let passwordVisible = false;
let originalName = "";
let originalEmail = "";

const reauthModal = new bootstrap.Modal(document.getElementById("reauthModal"));
const currentPasswordInput = document.getElementById("currentPasswordInput");
const confirmReauthBtn = document.getElementById("confirmReauthBtn");

// Enable edit mode
editBtn.addEventListener("click", () => {
  originalName = nameInput.value;
  originalEmail = emailInput.value;

  nameInput.removeAttribute("readonly");
  emailInput.removeAttribute("readonly");

  saveBtn.classList.remove("d-none");
  changePasswordBtn.classList.remove("d-none");
  cancelBtn.classList.remove("d-none");
  editBtn.classList.add("d-none");
});

// Cancel edit
cancelBtn.addEventListener("click", () => {
  const hasNameChanged = nameInput.value !== originalName;
  const hasEmailChanged = emailInput.value !== originalEmail;
  const hasPasswordChanged = passwordInput.value !== "" || confirmNewPasswordInput.value !== "";

  if (hasNameChanged || hasEmailChanged || hasPasswordChanged) {
    const confirmCancel = confirm("You have unsaved changes. Are you sure you want to cancel?");
    if (!confirmCancel) return;
  }

  nameInput.value = originalName;
  emailInput.value = originalEmail;
  passwordInput.value = "";
  confirmNewPasswordInput.value = "";

  nameInput.setAttribute("readonly", true);
  emailInput.setAttribute("readonly", true);
  passwordSection.classList.add("d-none");

  saveBtn.classList.add("d-none");
  cancelBtn.classList.add("d-none");
  changePasswordBtn.classList.add("d-none");
  editBtn.classList.remove("d-none");
});

// Toggle password fields
changePasswordBtn.addEventListener("click", () => {
  passwordSection.classList.remove("d-none");
  changePasswordBtn.classList.add("d-none");
  passwordInput.value = "";
  confirmNewPasswordInput.value = "";
});

// Save changes
saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("No user is signed in.");

  const newName = nameInput.value.trim();
  const newEmail = emailInput.value.trim();
  const newPassword = passwordInput.value;
  const confirmPassword = confirmNewPasswordInput.value;

  const uid = user.uid;

  const isNameChanged = newName && newName !== user.displayName;
  const isEmailChanged = newEmail && newEmail !== user.email;
  const isPasswordChanged = newPassword || confirmPassword;

  if (newPassword && newPassword !== confirmPassword) {
    return alert("Passwords do not match.");
  }

  try {
    if (isNameChanged && !isEmailChanged && !isPasswordChanged) {
      await updateProfile(user, { displayName: newName });

      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        name: newName,
        updatedAt: new Date(),
      });

      await logEvent("User Profile Update", `Name updated to "${newName}"`, newName);

      alert("Name updated successfully!");
      window.location.reload();
      return;
    }

    if (isEmailChanged || isPasswordChanged) {
      reauthModal.show();

      confirmReauthBtn.onclick = async () => {
        const currentPassword = currentPasswordInput.value.trim();
        if (!currentPassword) return alert("Please enter your current password.");

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        try {
          await reauthenticateWithCredential(user, credential);
          reauthModal.hide();

          if (isNameChanged) {
            await updateProfile(user, { displayName: newName });
          }
          if (isEmailChanged) {
            await updateEmail(user, newEmail);
            await user.sendEmailVerification();
            alert("A verification email has been sent to your new email. Please verify it.");
          }
          if (isPasswordChanged) {
            await updatePassword(user, newPassword);
          }

          const userRef = doc(db, "users", uid);
          await updateDoc(userRef, {
            name: newName,
            email: newEmail,
            updatedAt: new Date(),
          });

          await logEvent(
            "User Profile Update",
            `Updated: ${isNameChanged ? "name, " : ""}${isEmailChanged ? "email, " : ""}${isPasswordChanged ? "password" : ""}`,
            newName
          );

          alert("Profile updated!");
          window.location.reload();
        } catch (err) {
          alert("Reauthentication failed: " + err.message);
          console.error("Reauthentication failed:", err);
        }
      };
    }
  } catch (err) {
    console.error("Profile update error:", err);
    alert("Update failed: " + err.message);
  }
});
