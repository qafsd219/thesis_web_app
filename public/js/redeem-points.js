import {
  auth,
  db,
  realtimeDb,
  ref,
  get,
  set,
  push,
  doc,
  getDoc,
  runTransaction,
  onAuthStateChanged
} from "./firebase-config.js";
import { logEvent } from "./logger.js";

// DOM elements
const currentPointsEl = document.getElementById("currentPoints");
const redeemModalEl = document.getElementById("redeemPointsModal");
const pointsInput = document.getElementById("pointsToRedeem");
const maxPointsText = document.getElementById("maxPointsText");
const confirmBtn = document.getElementById("confirmRedeemBtn");

// Show modal and fetch max points
redeemModalEl.addEventListener("show.bs.modal", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  const current = snap.exists() ? snap.data().currentPoints : 0;

  pointsInput.max = current;
  pointsInput.value = current > 0 ? 1 : 0;
  maxPointsText.textContent = current;
  confirmBtn.disabled = current < 1;
});

// Handle confirm
confirmBtn.addEventListener("click", async () => {
  const pts = parseInt(pointsInput.value, 10);
  await redeemPoints(pts);
  bootstrap.Modal.getInstance(redeemModalEl).hide();
});

// Redeem function
async function redeemPoints(points) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in first.");
    await logEvent("Redeem Failed", "User not signed in.");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const gpioPaths = ["gpio_4", "gpio_17"];
  let selectedGpio = null;

  try {
    const relaySnap = await get(ref(realtimeDb, "relayCommands"));
    let activeCount = 0;
    let userHasActive = false;
    const usage = { gpio_4: 0, gpio_17: 0 };

    if (relaySnap.exists()) {
      const relayData = relaySnap.val();
      for (const key of gpioPaths) {
        const sessions = relayData[key] || {};
        for (const sid in sessions) {
          const s = sessions[sid];
          if (s.status === "pending" || s.status === "running") {
            activeCount++;
            usage[key]++;
            if (s.userId === user.uid) userHasActive = true;
          }
        }
      }
    }

    if (userHasActive) {
      alert("You already have an active session.");
      await logEvent("Redeem Blocked", "Attempted redeem while active session exists.");
      return;
    }

    if (activeCount >= 2) {
      alert("Max 2 users can redeem at once.");
      await logEvent("Redeem Blocked", "Max concurrent sessions reached.");
      return;
    }

    selectedGpio = usage["gpio_4"] <= usage["gpio_17"] ? "gpio_4" : "gpio_17";

    await runTransaction(db, async (tx) => {
      const docSnap = await tx.get(userRef);
      if (!docSnap.exists()) throw new Error("User not found.");
      const current = docSnap.data().currentPoints || 0;
      if (current < points) throw new Error("Insufficient points.");
      tx.update(userRef, { currentPoints: current - points });
    });

    const cmdRef = push(ref(realtimeDb, `relayCommands/${selectedGpio}`));
    await set(cmdRef, {
      userId: user.uid,
      durationSec: points * 60,
      status: "pending",
      timestamp: Date.now(),
    });

    currentPointsEl.textContent = parseInt(currentPointsEl.textContent, 10) - points;
    alert(`Relay on ${selectedGpio} will run for ${points * 60} seconds.`);

    await logEvent("Redeem Success", `User redeemed ${points} points on ${selectedGpio}`);
  } catch (err) {
    console.error(err);
    alert("Redeem failed: " + err.message);
    await logEvent("Redeem Failed", `Error: ${err.message}`);
  }
}

// Update UI on login
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const snap = await getDoc(doc(db, "users", user.uid));
  const pts = snap.exists() ? snap.data().currentPoints : 0;
  currentPointsEl.textContent = pts;
});