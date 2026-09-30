import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import { auth } from "./firebase-config.js";
import { initGitHubModule } from "./github.js";

// Safe Selector Helper (Prevents Null Errors)
const getEl = (id) => document.getElementById(id);

// DOM Elements
const authCard = getEl('authCard') || getEl('auth-card');
const dashboardCard = getEl('dashboardCard') || getEl('dashboard-layout');
const emailForm = getEl('emailForm') || getEl('auth-form');
const emailInput = getEl('emailInput') || getEl('email');
const passwordInput = getEl('passwordInput') || getEl('password');
const submitAuthBtn = getEl('submitAuthBtn') || getEl('submit-btn');
const togglePasswordBtn = getEl('togglePasswordBtn') || getEl('toggle-password');
const forgotPasswordBtn = getEl('forgotPasswordBtn') || getEl('forgot-btn');
const toggleModeBtn = getEl('toggleModeBtn') || getEl('toggle-auth-mode');
const toggleModeText = getEl('toggleModeText');
const formTitle = getEl('formTitle') || getEl('auth-title');
const formSubtitle = getEl('formSubtitle') || getEl('auth-subtitle');
const statusBanner = getEl('statusBanner') || getEl('alert-box');

// Auth Action Buttons
const btnGoogle = getEl('btnGoogle') || getEl('google-btn');
const btnFacebook = getEl('btnFacebook') || getEl('facebook-btn');
const btnSignOut = getEl('btnSignOut') || getEl('logout-btn');

// User Profile Elements
const userName = getEl('userName') || getEl('user-display-name');
const userEmail = getEl('userEmail') || getEl('user-email');
const userAvatar = getEl('userAvatar') || getEl('avatar-container');

let isSignUp = false;

// UI Helper: Display Messages
function showStatus(message, isError = false) {
  if (!statusBanner) return;
  statusBanner.textContent = message;
  statusBanner.style.display = 'block';
  statusBanner.className = `status-banner alert-message ${isError ? 'error alert-error' : 'success alert-success'}`;
}

function clearStatus() {
  if (!statusBanner) return;
  statusBanner.textContent = '';
  statusBanner.style.display = 'none';
  statusBanner.className = 'status-banner alert-message';
}

// Password Visibility Toggle
if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.textContent = isPassword ? 'Hide' : 'Show';
  });
}

// Toggle between Sign In and Sign Up Modes
if (toggleModeBtn) {
  toggleModeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;
    clearStatus();

    if (formTitle) formTitle.textContent = isSignUp ? "Create Account" : "Welcome Back";
    if (formSubtitle) formSubtitle.textContent = isSignUp ? "Get started with your Aivora workspace." : "Sign in to continue to your workspace.";
    if (submitAuthBtn) submitAuthBtn.textContent = isSignUp ? "Create Account" : "Sign In";
    if (toggleModeBtn) toggleModeBtn.textContent = isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create Account";
  });
}

// Form Submission: Email/Password
if (emailForm) {
  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatus();
    
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!email || !password) {
      showStatus("Please complete all required fields.", true);
      return;
    }

    if (submitAuthBtn) {
      submitAuthBtn.disabled = true;
      submitAuthBtn.textContent = isSignUp ? "Creating..." : "Authenticating...";
    }

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        showStatus("Account created successfully.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showStatus("Signed in successfully.");
      }
    } catch (err) {
      showStatus(formatFirebaseError(err.code), true);
    } finally {
      if (submitAuthBtn) {
        submitAuthBtn.disabled = false;
        submitAuthBtn.textContent = isSignUp ? "Create Account" : "Sign In";
      }
    }
  });
}

// Google Authentication
if (btnGoogle) {
  btnGoogle.addEventListener('click', async () => {
    clearStatus();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      showStatus(formatFirebaseError(err.code), true);
    }
  });
}

// Facebook Authentication (Meta Login Fix)
if (btnFacebook) {
  btnFacebook.addEventListener('click', async () => {
    clearStatus();
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      showStatus(formatFirebaseError(err.code), true);
    }
  });
}

// Password Reset Email
if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    clearStatus();
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email) {
      showStatus("Enter your email address to receive reset instructions.", true);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showStatus("Password reset link sent to your email.");
    } catch (err) {
      showStatus(formatFirebaseError(err.code), true);
    }
  });
}

// Sign Out Action
if (btnSignOut) {
  btnSignOut.addEventListener('click', async () => {
    try {
      await signOut(auth);
      showStatus("You have been signed out.");
    } catch (err) {
      showStatus("Error signing out.", true);
    }
  });
}

// Authentication State Listener & Dashboard Protection
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (authCard) authCard.style.display = 'none';
    if (dashboardCard) dashboardCard.style.display = 'block';

    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
    if (userName) userName.textContent = displayName;
    if (userEmail) userEmail.textContent = user.email || 'N/A';
    
    if (userAvatar) {
      if (userAvatar.tagName === 'IMG') {
        userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=595F39&color=fff`;
      } else {
        userAvatar.innerHTML = user.photoURL 
          ? `<img src="${user.photoURL}" alt="${displayName}">` 
          : `<div class="avatar-placeholder">${displayName.substring(0, 2).toUpperCase()}</div>`;
      }
    }

    // Initialize GitHub repository integration module if present
    if (typeof initGitHubModule === 'function') {
      initGitHubModule(user);
    }
    
    // Redirect to dashboard page if on separate login page
    if (window.location.pathname.includes('login.html')) {
      window.location.href = 'dashboard.html';
    }
  } else {
    if (authCard) authCard.style.display = 'block';
    if (dashboardCard) dashboardCard.style.display = 'none';

    // Protect dashboard page from unauthenticated users
    if (window.location.pathname.includes('dashboard.html')) {
      window.location.href = 'login.html';
    }
  }
});

// Helper: Human-readable error messages
function formatFirebaseError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return "Invalid email or password.";
    case 'auth/email-already-in-use':
      return "An account with this email address already exists.";
    case 'auth/account-exists-with-different-credential':
      return "Is email se pehle Google/Email se account bana hua hai. Pehle us method se sign in karein.";
    case 'auth/weak-password':
      return "Password should be at least 6 characters long.";
    case 'auth/popup-closed-by-user':
      return "Sign-in popup was closed before completing.";
    case 'auth/cancelled-popup-request':
      return "Multiple popups opened. Please try again.";
    default:
      return "Authentication error: " + (code || "Unknown state");
  }
}
