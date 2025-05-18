import { auth, db, realtimeDb, ref, get, set, update } from "./firebase-config.js";
import { logEvent } from "./logger.js";

async function pairCode() {
  const inputField = document.getElementById("pairCode");
  const code = inputField.value.trim().toUpperCase();
  const user = auth.currentUser;

  if (!user) {
    alert("Login first");
    return;
  }

  if (!code) {
    alert("Please enter a pairing code.");
    inputField.focus();
    return;
  }

  const codeRef = ref(realtimeDb, `pairing_codes/${code}`);

  try {
    const snapshot = await get(codeRef);

    if (!snapshot.exists()) {
      alert("Invalid code");
      await logEvent("Pair Failed", `Invalid code entered: ${code}`);
      return;
    }

    await update(codeRef, {
      status: "active",
      uid: user.uid,
      linkedAt: Date.now()
    });

    console.log("Code linked!");
    await logEvent("Pair Successful", `Code ${code} successfully paired.`);

    if (document.activeElement) {
      document.activeElement.blur();
    }

    const modalEl = document.getElementById("pairingModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    // Optional: move focus to a safe element
    setTimeout(() => {
      const safeFocusTarget = document.querySelector('[data-target="dashboard"]');
      if (safeFocusTarget) safeFocusTarget.focus();
    }, 200);

  } catch (error) {
    console.error("Error accessing database:", error);
    alert("Something went wrong. Please try again.");
    await logEvent("Pair Failed", `Error: ${error.message}`);
  }
}

document.getElementById("submitPairCodeBtn").addEventListener("click", pairCode);
