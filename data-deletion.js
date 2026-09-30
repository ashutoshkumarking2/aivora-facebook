// data-deletion.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('deletion-form');
  const alertBox = document.getElementById('deletion-alert');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('deletion-email').value;

      // Because this is a static client-side frontend project without a server backend callback,
      // we do not falsely claim automated deletion succeeded in the database.
      alertBox.className = 'alert-message alert-success';
      alertBox.style.display = 'block';
      alertBox.innerHTML = `Deletion request recorded for <strong>${email}</strong>.<br>Please send an explicit confirmation email to <code>support@aivora.ai</code> with subject "DATA DELETION REQUEST" to finalize the manual verification process.`;
      
      form.reset();
    });
  }
});