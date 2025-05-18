import {
  db,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "./firebase-config.js";

const tableBody = document.getElementById("leaderboard-body");

async function fetchLeaderboard() {
  try {
    const usersRef = collection(db, "users");
    const leaderboardQuery = query(usersRef, orderBy("totalPoints", "desc"), limit(10));
    const snapshot = await getDocs(leaderboardQuery);

    const users = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name && typeof data.totalPoints === "number") {
        users.push({ name: data.name, totalPoints: data.totalPoints });
      }
    });

    tableBody.innerHTML = ""; // Clear current rows

    users.forEach((user, index) => {
      const row = document.createElement("tr");

      // Assign medals to top 3
      let rankDisplay;
      switch (index) {
        case 0:
          rankDisplay = "🥇 1";
          break;
        case 1:
          rankDisplay = "🥈 2";
          break;
        case 2:
          rankDisplay = "🥉 3";
          break;
        default:
          rankDisplay = index + 1;
      }

      row.innerHTML = `
        <td>${rankDisplay}</td>
        <td>${user.name}</td>
        <td>${user.totalPoints}</td>
      `;

      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
  }
}

fetchLeaderboard();
setInterval(fetchLeaderboard, 60000);