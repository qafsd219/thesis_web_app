import {
    db,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    deleteDoc,
    getDoc
  } from "./firebase-config.js";
  import { logEvent } from "./logger.js";
  
  // Load data into table
  async function loadEmployees() {
    const tbody = document.getElementById("admin-settings-body");
    tbody.innerHTML = "";
  
    const querySnapshot = await getDocs(collection(db, "admin", "employees", "details"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;
  
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.name}</td>
        <td>${data.email}</td>
        <td>${data.mobile_no}</td>
        <td>
          <select class="form-select form-select-sm status-dropdown" data-id="${docId}">
            <option value="active" ${data.status === "active" ? "selected" : ""}>Active</option>
            <option value="inactive" ${data.status === "inactive" ? "selected" : ""}>Inactive</option>
          </select>
        </td>
        <td>
          <button class="btn btn-warning btn-sm edit-btn" data-id="${docId}">Edit</button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${docId}">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  
    // Add real-time status update listeners
    const statusDropdowns = document.querySelectorAll(".status-dropdown");
    statusDropdowns.forEach((dropdown) => {
      dropdown.addEventListener("change", async (e) => {
        const newStatus = e.target.value;
        const employeeId = e.target.getAttribute("data-id");
  
        try {
          const docRef = doc(db, "admin", "employees", "details", employeeId);
          await updateDoc(docRef, { status: newStatus });
          console.log(`Status updated to "${newStatus}" for employee ID: ${employeeId}`);
          logEvent("Status Update", `Employee ID: ${employeeId}, Status: ${newStatus}`);
        } catch (error) {
          console.error("Failed to update status:", error);
          alert("Failed to update status. Please try again.");
          logEvent("Status Update Error", `Employee ID: ${employeeId}, Error: ${error.message}`);
        }
      });
    });
  
    // Add event listeners for Edit and Delete buttons
    const editButtons = document.querySelectorAll(".edit-btn");
    const deleteButtons = document.querySelectorAll(".delete-btn");
  
    editButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const employeeId = e.target.getAttribute("data-id");
        const modal = new bootstrap.Modal(document.getElementById("addEmployeeModal"));
        const docRef = doc(db, "admin", "employees", "details", employeeId); // Corrected to DocumentReference
  
        try {
          const docSnap = await getDoc(docRef); // Use getDoc() for a single document
          if (!docSnap.exists()) {
            console.error("No such document!");
            alert("Employee not found.");
            return;
          }
  
          const data = docSnap.data();
          document.getElementById("employeeName").value = data.name;
          document.getElementById("employeeEmail").value = data.email;
          document.getElementById("employeeMobile").value = data.mobile_no;
          document.getElementById("employeeStatus").value = data.status;
          document.getElementById("employeeForm").dataset.id = employeeId;  // Store employee ID in the form
          
          modal.show();
        } catch (error) {
          console.error("Error fetching employee data:", error);
          alert("Failed to load employee data.");
        }
      });
    });
  
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const employeeId = e.target.getAttribute("data-id");
        const confirmed = confirm("Are you sure you want to delete this employee?");
        if (confirmed) {
          try {
            const docRef = doc(db, "admin", "employees", "details", employeeId);
            await deleteDoc(docRef);
            alert("Employee deleted successfully.");
            logEvent("Employee Deleted", `Employee ID: ${employeeId}`);
            console.log("Employee deleted successfully.");
            loadEmployees();  // Reload employee data
          } catch (error) {
            console.error("Error deleting employee:", error);
            logEvent("Employee Deletion Error", `Employee ID: ${employeeId}, Error: ${error.message}`);
            alert("Failed to delete employee.");
          }
        }
      });
    });
  }
  
  // Show modal on button click
  document.getElementById("addEmployee").addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("addEmployeeModal"));
    modal.show();
  
    // Clear employee ID to signify this is an "Add" action
    document.getElementById("employeeForm").dataset.id = "";  // Clear the employeeId when adding a new employee
  });
  
  // Handle form submit (Add and Edit)
  document.getElementById("employeeForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("employeeName").value.trim();
    const email = document.getElementById("employeeEmail").value.trim();
    const mobile_no = document.getElementById("employeeMobile").value.trim();
    const status = document.getElementById("employeeStatus").value;
    const employeeId = e.target.dataset.id;  // Get employee ID from the form's data attribute

    if (!name || !email || !mobile_no || !status) {
      alert("All fields are required.");
      return;
    }
  
    try {
      if (employeeId) {
        // Check if the document exists before trying to update it
        const docRef = doc(db, "admin", "employees", "details", employeeId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          console.error("No such document!");
          alert("Employee not found. Please try again.");
          logEvent("Employee Update Error", `Employee ID: ${employeeId}, Error: Document not found`);
          return;
        }

        // Update existing employee if document exists
        await updateDoc(docRef, { name, email, mobile_no, status });
        console.log("Employee updated successfully.");
        logEvent("Employee Updated", `Employee ID: ${employeeId}, Name: ${name}`);
      } else {
        // Add new employee if no employeeId exists
        await addDoc(collection(db, "admin", "employees", "details"), { name, email, mobile_no, status });
        console.log("Employee added successfully.");
        logEvent("Employee Added", `Employee Name: ${name}`);
      }
  
      const modal = bootstrap.Modal.getInstance(document.getElementById("addEmployeeModal"));
      modal.hide();
      e.target.reset();
      loadEmployees();
    } catch (error) {
      console.error("Error processing employee:", error);
      alert("Failed to process employee.");
    }
  });
  
  // Load table on page load
  document.addEventListener("DOMContentLoaded", loadEmployees);
  