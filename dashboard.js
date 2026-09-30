// dashboard.js
import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  const userDisplayName = document.getElementById('user-display-name');
  const userEmail = document.getElementById('user-email');
  const userProvider = document.getElementById('user-provider');
  const userUid = document.getElementById('user-uid');
  const avatarContainer = document.getElementById('avatar-container');

  // Route Guard
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    // Populate user profile
    const name = user.displayName || 'Distinguished Member';
    userDisplayName.textContent = name;
    userEmail.textContent = user.email || 'N/A';
    userUid.textContent = user.uid;

    const providerId = user.providerData[0]?.providerId || 'password';
    userProvider.textContent = providerId.replace('.com', '');

    if (user.photoURL) {
      avatarContainer.innerHTML = `<img src="${user.photoURL}" alt="${name}">`;
    } else {
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      avatarContainer.innerHTML = `<div class="avatar-placeholder">${initials}</div>`;
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        window.location.href = 'login.html';
      } catch (err) {
        console.error("Logout Error:", err);
      }
    });
  }
});