// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import for Authentication
import { getFirestore } from "firebase/firestore"; // Import for Firestore
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0Fv-zYwNY051JuDG8d3uZFCTQjo4tzC4",
  authDomain: "capstone-471cd.firebaseapp.com",
  projectId: "capstone-471cd",
  storageBucket: "capstone-471cd.appspot.com",
  messagingSenderId: "303816748152",
  appId: "1:303816748152:web:c954f0b8e6ebffa8c8d18d",
  measurementId: "G-5HW2G7P3DT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Firebase Authentication
const db = getFirestore(app); // Initialize Firestore
const analytics = getAnalytics(app); // Initialize Analytics

export { auth, db }; // Export the auth and db instances
