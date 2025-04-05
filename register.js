// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js"; // Add Firestore imports

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAL0L-dV68PJ5aNlzHbhaIcF5ct8r-bfME",
  authDomain: "tochat-51d2e.firebaseapp.com",
  projectId: "tochat-51d2e",
  storageBucket: "tochat-51d2e.appspot.com",
  messagingSenderId: "461338688045",
  appId: "1:461338688045:web:4bd261fa497cfdcdd556a4",
  measurementId: "G-V427YJYHLT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Handle form submission
document.getElementById('registerBtn').addEventListener("click", function(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const passwordConfirm = document.getElementById('passwordConfirm').value.trim();

  // Basic validation
  if (!name || !email || !password || !passwordConfirm) {
    alert("Please fill in all fields.");
    return;
  }

  if (password !== passwordConfirm) {
    alert("Passwords do not match.");
    return;
  }

  // Create user with email and password
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up successfully
      const user = userCredential.user;

      // Now store the user's additional data in Firestore
      const userRef = doc(db, "users", user.uid); // Reference to user document
      setDoc(userRef, {
        name: name,
        email: email,
        createdAt: new Date(),
        avatarUrl: "",  // Add a default avatar URL or leave empty for now
      })
      .then(() => {
        alert("Account created successfully!");
        // Optionally, redirect the user or perform additional actions
        window.location.href = "login.html"; 
      })
      .catch((error) => {
        console.error("Error storing user data: ", error);
        alert(`Error storing user data: ${error.message}`);
      });
    })
    .catch((error) => {
      // Handle errors during user creation
      const errorMessage = error.message;
      alert(`Error: ${errorMessage}`);
    });
});
