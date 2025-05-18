import {
  db,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs
} from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
  const logsBody = document.getElementById("logs-body");
  const nextBtn  = document.getElementById("nextBtn");
  const prevBtn  = document.getElementById("prevBtn");

  const logsRef  = collection(db, "logs");
  const pageSize = 10;

  let cursors     = [null];  // cursors[1] = lastDoc of page1, cursors[2] = lastDoc of page2, …
  let currentPage = 1;

  async function loadPage(cursor, page) {
    try {
      // build base query
      let q = query(
        logsRef,
        orderBy("timestamp", "desc"),
        limit(pageSize)
      );
      // if we have a cursor, start after it
      if (cursor) {
        q = query(
          logsRef,
          orderBy("timestamp", "desc"),
          startAfter(cursor),
          limit(pageSize)
        );
      }

      const snap = await getDocs(q);
      const docs = snap.docs;

      // render rows
      logsBody.innerHTML = "";
      docs.forEach(doc => {
        const { timestamp, user, event, details } = doc.data();
        const ts = timestamp?.toDate
          ? timestamp.toDate().toLocaleString()
          : "Unknown time";
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${ts}</td>
          <td>${user || "Unknown user"}</td>
          <td>${event || "No action"}</td>
          <td>${details || "No details"}</td>
        `;
        logsBody.appendChild(row);
      });

      // store the last doc of this page as the cursor for the *next* page
      cursors[page] = docs.length
        ? docs[docs.length - 1]
        : cursors[page]; // if empty, leave previous cursor

      currentPage = page;

      // update button states
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = docs.length < pageSize;

    } catch (err) {
      console.error("Error loading logs:", err);
    }
  }

  // wire up buttons
  nextBtn.addEventListener("click", () => {
    if (!nextBtn.disabled) {
      // to load page N+1, we start after the last doc of page N
      loadPage(cursors[currentPage], currentPage + 1);
    }
  });

  prevBtn.addEventListener("click", () => {
    if (!prevBtn.disabled) {
      // to go back to page N-1, start after the last doc of page (N-2)
      // when N-1 === 1, we pass null → first page
      const prevCursor = currentPage > 2
        ? cursors[currentPage - 2]
        : null;
      loadPage(prevCursor, currentPage - 1);
    }
  });

  // initial load of page 1
  loadPage(null, 1);
});
