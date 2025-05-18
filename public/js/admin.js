import {
  auth,
  db,
  doc,
  getDoc,
  getDocs,
  collection,
  onAuthStateChanged,
} from "./firebase-config.js";

// CHECK IF LOGGED IN AS ADMIN
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You are not logged in. Please log in and try again.");
    window.location.href = "index.html";
  } 
  else {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      if (userData.role !== "admin") {
        alert("Access denied: Admins only");
        window.location.href = "user.html";
      } else {
        // Fetch metrics and user count
        await fetchMetrics();
        await fetchUserCount();
        setInterval(fetchMetrics, 60000); // Refresh every minute
        setInterval(fetchUserCount, 60000); // Refresh user count every minute
      }
    } 
    catch (err) {
      console.error("Error fetching user role:", err);
      window.location.href = "index.html";
    }
  }
});

async function fetchMetrics() { 
  try {
    const metricsDocRef = doc(db, "admin", "metrics");
    const metricsDocSnap = await getDoc(metricsDocRef);

    if (metricsDocSnap.exists()) {
      const metricsData = metricsDocSnap.data();
      // Update the DOM elements
      document.getElementById("totalBottles").textContent = metricsData.totalBottles ?? 0;
      document.getElementById("todayBottles").textContent = metricsData.todayBottles ?? 0;
      document.getElementById("yesterdayBottles").textContent = metricsData.yesterdayBottles ?? 0;
      document.getElementById("weeklyBottles").textContent = metricsData.weeklyBottles ?? 0;
      // totalUsers parameter under fetchUserCount
      document.getElementById("completedSessions").textContent = metricsData.completedSessions ?? 0;
      document.getElementById("bottleBinLevel").textContent = metricsData.bottleBin;
      document.getElementById("otherBinLevel").textContent = metricsData.otherBin;
    }
    else {
      console.log("No metrics document found!");
    }
  }
  catch (err) {
    console.error("Error fetching metrics:", err);
  }
}

// ✅ Count total users in "users" collection
async function fetchUserCount() {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const userCount = usersSnapshot.size;
    document.getElementById("totalUsers").textContent = userCount;
  } catch (err) {
    console.error("Error fetching user count:", err);
    document.getElementById("totalUsers").textContent = "Error";
  }
}
