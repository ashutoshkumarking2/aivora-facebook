// auth.js
import { auth, googleProvider, facebookProvider } from "./firebase-config.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Ensure Facebook provider does not throw scope errors
if (facebookProvider) {
  // Clear explicit scopes if causing Meta 'Invalid Scopes' issues
  facebookProvider.setCustomParameters({
    'display': 'popup'
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Protect redirect & Auth State Observer
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // If already logged in, navigate to dashboard
      if (window.location.pathname.includes('login.html') || window.location.pathname === '/') {
        window.location.href = 'dashboard.html';
      }
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
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `alert-message ${isError ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';
  }

  function clearAlert() {
    if (!alertBox) return;
    alertBox.style.display = 'none';
  }

  // Format Firebase Error Codes into readable messages
  function formatError(err) {
    const code = err.code || '';
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return "Invalid email or password.";
      case 'auth/email-already-in-use':
        return "An account with this email address already exists.";
      case 'auth/account-exists-with-different-credential':
        return "Is email se pehle Google ya Email se account bana hua hai. Kripya pehle us method se sign in karein.";
      case 'auth/popup-closed-by-user':
        return "Sign-in popup closed before completion.";
      case 'auth/cancelled-popup-request':
        return "Multiple popups opened. Please try again.";
      default:
        return err.message ? err.message.replace('Firebase:', '').trim() : "Authentication failed.";
    }
  }

  // Toggle Password
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePasswordBtn.textContent = type === 'password' ? 'Show' : 'Hide';
    });
  }

  // Toggle Mode (Login / Signup)
  if (toggleAuthMode) {
    toggleAuthMode.addEventListener('click', (e) => {
      e.preventDefault();
      isSignUp = !isSignUp;
      clearAlert();
      const titleEl = document.getElementById('auth-title');
      if (titleEl) titleEl.textContent = isSignUp ? 'Create Account' : 'Welcome Back';
      if (submitBtn) submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
      toggleAuthMode.textContent = isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up";
    });
  }

  // Form Submission
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();
      const emailInput = document.getElementById('email');
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';

      if (!email || !password) {
        showAlert('Please enter both email and password.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
      }

      try {
        if (isSignUp) {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
        // Redirect is automatically handled by onAuthStateChanged
      } catch (err) {
        showAlert(formatError(err));
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
        }
      }
    });
  }

  // Social Auth: Google
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      clearAlert();
      try {
        await signInWithPopup(auth, googleProvider);
        // Redirect handled by onAuthStateChanged listener
      } catch (err) {
        showAlert(formatError(err));
      }
    });
  }

  // Social Auth: Facebook
  if (facebookBtn) {
    facebookBtn.addEventListener('click', async () => {
      clearAlert();
      try {
        await signInWithPopup(auth, facebookProvider);
        // Redirect handled by onAuthStateChanged listener
      } catch (err) {
        showAlert(formatError(err));
      }
    });
  }

  // Forgot Password
  if (forgotBtn) {
    forgotBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      clearAlert();
      const emailInput = document.getElementById('email');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) {
        showAlert('Please enter your email address first.');
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        showAlert('Password reset link sent to your email.', false);
      } catch (err) {
        showAlert(formatError(err));
      }
    });
  }
});
