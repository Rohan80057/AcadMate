// app.js

// If you are using ES modules or bundling, use imports;
// Otherwise ensure these modules expose window.loadXYZ functions.

import { loadHome } from './modules/home.js';  // optional if you use a home module
import { loadNavbar } from './modules/navbar.js';  // optional dynamic sidebar loader
import { loadPomodoro } from './modules/pomodoro.js';
import { loadNotes } from './modules/notes.js';
import { setupDarkMode } from './modules/darkmode.js';
import { loadPdfViewer } from './modules/pdfViewer.js';
import { loadWebview } from './modules/webview.js';

window.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar"); // assuming sidebar class
  const main = document.getElementById("main");

  // Optional: dynamically load navbar (if you have it)
  if (sidebar && typeof loadNavbar === "function") loadNavbar(sidebar);

  // Setup dark mode switcher
  setupDarkMode();

  function fadeInMainContent() {
    main.classList.remove("fade-in");
    void main.offsetWidth;
    main.classList.add("fade-in");
  }

  // Splash screen button: show app container and optionally load home
  const beginBtn = document.getElementById("enter-site");
  if (beginBtn && main) {
    beginBtn.addEventListener("click", () => {
      const splash = document.getElementById("splash-screen");
      if (splash) splash.style.display = "none";

      const appContainer = document.querySelector(".app-container");
      if (appContainer) appContainer.style.display = "flex";

      document.body.classList.remove("loading");
      setTimeout(() => {
        document.body.classList.add("app-loaded");
      }, 10);

      // Optional: load home content
      if (typeof loadHome === "function") loadHome(main);
      fadeInMainContent();
    });
  }

  // Sidebar buttons nav logic
  // Sidebar buttons nav logic
  const navButtons = document.querySelectorAll('.sidebar nav ul li button');

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const moduleId = btn.id || btn.getAttribute('data-module');
      let loader = null;

      switch (moduleId) {
        case 'pomodoroBtn':
          loader = loadPomodoro;
          break;
        case 'notes':
          loader = loadNotes;
          break;
        case 'pdfViewer':
          loader = loadPdfViewer;
          break;
        case 'webview':
          loader = loadWebview;
          break;
        case 'aiChat':
          loader = (container) => {
            container.innerHTML = "<h2>AI Chat is coming soon!</h2>";
          };
          break;
        default:
          console.error(`No loader function found for module: ${moduleId}`);
      }

      if (loader && main) {
        main.innerHTML = '';
        loader(main);
        fadeInMainContent();

        // Set active button styling
        navButtons.forEach(otherBtn => otherBtn.classList.remove("active"));
        btn.classList.add("active");
      }
    });
  });
});
