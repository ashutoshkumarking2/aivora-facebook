// main.js - Helper utilities
export function loadBrandLogo() {
  const logoElements = document.querySelectorAll('.brand-logo');
  logoElements.forEach(el => {
    const img = new Image();
    img.src = 'aivoralogo.png';
    img.alt = 'Aivora AI';
    img.onload = () => {
      el.innerHTML = `<img src="aivoralogo.png" alt="Aivora AI"><span>AIVORA AI</span>`;
    };
    img.onerror = () => {
      el.innerHTML = `<span class="serif-font text-gold" style="font-size:1.5rem; font-weight:600; letter-spacing:0.1em;">AIVORA</span>`;
    };
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadBrandLogo();
});