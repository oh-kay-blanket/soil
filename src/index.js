// import './style.css';
import './sass/style.scss';
import data from './soil.json';

import { mapProp } from './mapProp.js';
import { render } from './mapFunctions.js';

const map = new google.maps.Map(document.getElementById("root"),mapProp);

render(data, map);

// PWA Install functionality
let deferredPrompt;
const installPrompt = document.getElementById('install-prompt');
const installBtn = document.getElementById('install-btn');
const installClose = document.getElementById('install-close');

// Check if user is on mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Check if user has already dismissed the prompt
const hasUserDismissed = localStorage.getItem('installPromptDismissed') === 'true';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Only show on mobile and if not previously dismissed
  if (isMobile && !hasUserDismissed) {
    installPrompt.style.display = 'flex';
  }
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  // Clear the deferred prompt variable
  deferredPrompt = null;
  // Hide the install prompt
  installPrompt.style.display = 'none';
});

installClose.addEventListener('click', () => {
  // Hide the prompt and remember the dismissal
  installPrompt.style.display = 'none';
  localStorage.setItem('installPromptDismissed', 'true');
});

window.addEventListener('appinstalled', () => {
  // Hide the install prompt
  installPrompt.style.display = 'none';
  deferredPrompt = null;
});

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registered:', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}