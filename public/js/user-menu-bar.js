document.addEventListener("DOMContentLoaded", () => {
  const sections = {
    dashboard: document.getElementById("dashboard"),
    userProfile: document.getElementById("userProfile"),
    leaderboard: document.getElementById("leaderboard"),
  };

  // Initially hide all sections and show only the dashboard section
  Object.values(sections).forEach((section) => {
    section.classList.add("d-none");  // Add 'd-none' to hide sections initially
  });
  sections.dashboard.classList.remove("d-none"); // Show the dashboard by default

  // Add event listeners to menu items
  document.querySelectorAll("[data-target]").forEach((menuItem) => {
    menuItem.addEventListener("click", (event) => {
      event.preventDefault();
      const target = menuItem.getAttribute("data-target");

      // Hide all sections and show the selected one
      Object.values(sections).forEach((section) => {
        section.classList.add("d-none"); // Hide all sections
      });
      sections[target].classList.remove("d-none"); // Show selected section
      sections[target].classList.add("d-flex");

      // Collapse the navbar if it's open (for mobile)
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
