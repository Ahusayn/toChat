// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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

// Initialize Firebase Authentication
const auth = getAuth(app);

// Handle form submission for sign-in
document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Basic validation
  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  // Sign in user with email and password
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // ✅ Store the user email in localStorage
      localStorage.setItem("currentUser", user.email);

      // Redirect to chat page
      alert("Sign-in successful!");
      window.location.href = "chat.html";
    })
    .catch((error) => {
      alert(`Error: ${error.message}`);
    });
});
