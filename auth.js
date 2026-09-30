// auth.js
import { auth, googleProvider, facebookProvider } from "./firebase-config.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  // Protect redirect if already signed in
  onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.includes('login.html')) {
      window.location.href = 'dashboard.html';
    }
  });

  const authForm = document.getElementById('auth-form');
  const googleBtn = document.getElementById('google-btn');
  const facebookBtn = document.getElementById('facebook-btn');
  const forgotBtn = document.getElementById('forgot-btn');
  const toggleAuthMode = document.getElementById('toggle-auth-mode');
  const togglePasswordBtn = document.getElementById('toggle-password');
  
  const alertBox = document.getElementById('alert-box');
  const submitBtn = document.getElementById('submit-btn');
  const passwordInput = document.getElementById('password');

  let isSignUp = false;

  function showAlert(msg, isError = true) {
    alertBox.textContent = msg;
    alertBox.className = `alert-message ${isError ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';
  }

  function clearAlert() {
    alertBox.style.display = 'none';
  }

  // Toggle Password
  if(togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePasswordBtn.textContent = type === 'password' ? 'Show' : 'Hide';
    });
  }

  // Toggle Mode (Login / Signup)
  if(toggleAuthMode) {
    toggleAuthMode.addEventListener('click', (e) => {
      e.preventDefault();
      isSignUp = !isSignUp;
      clearAlert();
      document.getElementById('auth-title').textContent = isSignUp ? 'Create Account' : 'Welcome Back';
      submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
      toggleAuthMode.textContent = isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up";
    });
  }

  // Form Submission
  if(authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();
      const email = document.getElementById('email').value;
      const password = passwordInput.value;

      submitBtn.disabled = true;
      submitBtn.textContent = "Processing...";

      try {
        if (isSignUp) {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
        window.location.href = 'dashboard.html';
      } catch (err) {
        showAlert(err.message.replace('Firebase:', ''));
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
      }
    });
  }

  // Social Auth
  if(googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        window.location.href = 'dashboard.html';
      } catch(err) {
        showAlert(err.message.replace('Firebase:', ''));
      }
    });
  }

  if(facebookBtn) {
    facebookBtn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, facebookProvider);
        window.location.href = 'dashboard.html';
      } catch(err) {
        showAlert(err.message.replace('Firebase:', ''));
      }
    });
  }

  // Forgot Password
  if(forgotBtn) {
    forgotBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      if (!email) {
        showAlert('Please enter your email address first.');
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        showAlert('Password reset link sent to your email.', false);
      } catch (err) {
        showAlert(err.message.replace('Firebase:', ''));
      }
    });
  }
});
