// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, query, orderByChild } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCl-3L4e8mm6NwEyeKpaw8nOT-6N9DsRxI",
  authDomain: "rebuilt-scout.firebaseapp.com",
  databaseURL: "https://rebuilt-scout-default-rtdb.firebaseio.com",
  projectId: "rebuilt-scout",
  storageBucket: "rebuilt-scout.firebasestorage.app",
  messagingSenderId: "45792958634",
  appId: "1:45792958634:web:6eaed1c6460e009197d8d3",
  measurementId: "G-6YYVD4ZW0T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Export database reference
export { database, ref, push, set, onValue, query, orderByChild };