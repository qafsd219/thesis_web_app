import { db, doc, getDoc } from "./firebase-config.js";

// SLIDING LOGIN AND REGISTER FORM
document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("loginContainer");
  const loginBtn = document.getElementById("loginSlide");
  const registerBtn = document.getElementById("registerSlide");

  if (loginBtn && registerBtn) {
    registerBtn.addEventListener("click", () => {
      container.classList.add("active");
    });

    loginBtn.addEventListener("click", () => {
      container.classList.remove("active");
    });
  }
});

// MENU BAR FUNCTIONALITY
document.addEventListener("DOMContentLoaded", () => {
  const sections = {
    dashboard: document.getElementById("dashboard"),
    leaderboard: document.getElementById("leaderboard"),
    login: document.getElementById("login"),
  };

  Object.values(sections).forEach((section) => {
    section.classList.add("d-none");  
  });
  sections.dashboard.classList.remove("d-none"); 

  document.querySelectorAll("[data-target]").forEach((menuItem) => {
    menuItem.addEventListener("click", (event) => {
      event.preventDefault();
      const target = menuItem.getAttribute("data-target");

      Object.values(sections).forEach((section) => {
        section.classList.add("d-none"); 
      });
      sections[target].classList.remove("d-none"); 
      sections[target].classList.add("d-flex");

      const navbarCollapse = document.getElementById("navbarNav");
      if (navbarCollapse.classList.contains("show")) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
          toggle: false,
        });
        bsCollapse.hide();
      }
    });
  });
});

async function fetchMetrics() {
  try {
    const metricsDocRef = doc(db, "public", "metrics");
    const metricsDocSnap = await getDoc(metricsDocRef);

    if (metricsDocSnap.exists()) {
      const metricsData = metricsDocSnap.data();
      // Update the DOM elements
      document.getElementById("totalBottles").textContent =
        metricsData.totalBottles ?? 0;
      document.getElementById("todayBottles").textContent =
        metricsData.todayBottles ?? 0;
      document.getElementById("yesterdayBottles").textContent =
        metricsData.yesterdayBottles ?? 0;
      document.getElementById("weeklyBottles").textContent =
        metricsData.weeklyBottles ?? 0;
    } else {
      console.log("No metrics document found!");
    }
  } catch (err) {
    console.error("Error fetching metrics:", err);
  }
}

await fetchMetrics();
setInterval(fetchMetrics, 60000);
