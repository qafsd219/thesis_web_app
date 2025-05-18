import { db, collection, getDocs, updateDoc, doc, deleteDoc } from './firebase-config.js';
import { logEvent } from "./logger.js";

const tableBody = document.getElementById('user-table-body');

async function fetchUsers() {
    const userTableBody = document.getElementById("user-table-body");
    userTableBody.innerHTML = ""; // Clear current rows

    const querySnapshot = await getDocs(collection(db, "users"));

    querySnapshot.forEach((userDoc) => {
        const user = userDoc.data();
        const userId = userDoc.id;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="text-center">${user.userId || "N/A"}</td>
            <td class="text-center">${user.name || "N/A"}</td>
            <td class="text-center">${user.email || "N/A"}</td>
            <td class="text-center">${user.role || "user"}</td>
            <td class="align-middle">
                <div class="d-flex flex-wrap gap-1 justify-content-center">
                    <button 
                        class="btn btn-sm btn-primary editBtn" 
                        data-id="${userId}" 
                        data-name="${user.name}" 
                        data-email="${user.email}" 
                        data-role="${user.role}"
                        data-bs-toggle="modal"
                        data-bs-target="#editUserModal"
                    >
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger deleteBtn" data-id="${userId}">Delete</button>
                </div>
            </td>
        `;
        userTableBody.appendChild(row);
    });
    attachEditEventListeners();
    attachDeleteEventListeners();
}

function attachEditEventListeners() {
    document.querySelectorAll(".editBtn").forEach(button => {
        button.addEventListener("click", () => {
            const userId = button.getAttribute("data-id");
            const name = button.getAttribute("data-name");
            const email = button.getAttribute("data-email");
            const role = button.getAttribute("data-role");

            document.getElementById("editUserId").value = userId;
            document.getElementById("editUserName").value = name;
            document.getElementById("editUserEmail").value = email;
            document.getElementById("editUserRole").value = role;
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const editUserForm = document.getElementById("editUserForm");

    editUserForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const userId = document.getElementById("editUserId").value;
        const name = document.getElementById("editUserName").value;
        const email = document.getElementById("editUserEmail").value;
        const role = document.getElementById("editUserRole").value;

        const userRef = doc(db, "users", userId);
        try {
            await updateDoc(userRef, {
                name: name,
                email: email,
                role: role
            });

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("editUserModal"));
            modal.hide();

            // Refresh table
            fetchUsers();
            alert("User updated successfully!");
            logEvent("User Updated", `User Name: ${name}`);
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
            logEvent("User Update Failed", `User ID: ${userId}`);
        }
    });

    // Initial fetch
    fetchUsers();
});

function attachDeleteEventListeners() {
    document.querySelectorAll(".deleteBtn").forEach(button => {
        button.addEventListener("click", async () => {
            const userId = button.getAttribute("data-id");

            const confirmDelete = confirm("Are you sure you want to delete this user?");
            if (!confirmDelete) return;

            try {
                await deleteDoc(doc(db, "users", userId));
                await logEvent("User Deleted", `User ID: ${userId}`);
                alert("User deleted successfully!");
                fetchUsers(); // Refresh the table
            } catch (error) {
                console.error("Error deleting user:", error);
                await logEvent("User Deletion Failed", `User ID: ${userId}`);
                alert("Failed to delete user.");
            }
        });
    });
}
