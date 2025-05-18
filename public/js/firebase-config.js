// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateEmail, updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, collection, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, orderBy, query, runTransaction, limit, startAfter, endBefore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getDatabase, ref, set, get, child, update, remove, push } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjGDjgCe9zPC5HR0iHth123v891yXeB8g",
  authDomain: "binn-6260e.firebaseapp.com",
  databaseURL: "https://binn-6260e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "binn-6260e",
  storageBucket: "binn-6260e.firebasestorage.app",
  messagingSenderId: "565863558959",
  appId: "1:565863558959:web:7fc792eb26c79296697bda",
  measurementId: "G-GZSSQ06XKV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);

// Export the auth and db objects for use in other files
export { app, auth, db, realtimeDb, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateEmail, updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential, setPersistence, browserSessionPersistence, doc, collection, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, orderBy, query, runTransaction, getDatabase, ref, set, get, child, update, remove, push, limit, startAfter, endBefore }; 
//console.log("Firebase initialized successfully!", firebaseConfig);