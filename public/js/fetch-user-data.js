import { auth, db, onAuthStateChanged, doc, getDoc } from "./firebase-config.js";

// FETCH DATA FROM FIRESTORE
onAuthStateChanged(auth, (user) => {
    const loggedInUserID = localStorage.getItem("loggedInUserID");

    // REDIRECT TO LOGIN IF NOT LOGGED IN
    if (!loggedInUserID) {
        console.log("No user is signed in.");
        alert("You are not logged in. Please log in to access this page.");
        window.location.href = "index.html"; // Redirect to login page
        return;
    }

    // FETCH USER DATA
    const docRef = doc(db, "users", loggedInUserID);
    getDoc(docRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                console.log("User data:", userData);

                // Populate user information on the page
                document.getElementById("userName").value = userData.name;
                document.getElementById("userEmail").value = userData.email;
                document.getElementById("totalPoints").innerText = userData.totalPoints;
                document.getElementById("currentPoints").innerText = userData.currentPoints;
                document.getElementById("completedSessions").innerText = userData.completedSessions;
            } else {
                console.log("No document found!");
            }
        })
        .catch((error) => {
            console.log("Error getting document:", error);
        });
});
