const APP_VERSION = "1.3.0";

const CHANGELOG = [
  {
    version: "1.3.0",
    date: "June 20, 2026",
    changes: [
      { type: "New", text: "Added a 'Check for Updates' system! The app now downloads updates in the background and prompts you when a new version is ready." },
      { type: "Improved", text: "Sidebar menu buttons now have a highly visible hover effect in both Light and Dark mode." },
      { type: "Improved", text: "Sidebar actions are now neatly tucked directly above the version indicator for easier access." }
    ]
  },
  {
    version: "1.2.0",
    date: "June 20, 2026",
    changes: [
      { type: "New", text: "Added an interactive 'What's New' changelog to keep you updated on new features." },
      { type: "New", text: "Onboarding stepper indicators are now fully clickable for easier navigation." },
      { type: "Fixed", text: "Resolved an issue where the image crop modal would be hidden under the onboarding UI." }
    ]
  },
  {
    version: "1.1.0",
    date: "June 19, 2026",
    changes: [
      { type: "New", text: "Image cropper added to Setup Wizard to ensure your school logo is always a perfect square." },
      { type: "Improved", text: "Refreshed the UI density to be cleaner and more consistent across different screen sizes." }
    ]
  }
];

function checkVersionAndChangelog() {
  const sidebarText = document.getElementById('sidebarVersionText');
  if (sidebarText) sidebarText.textContent = 'v' + APP_VERSION;

  const lastSeen = localStorage.getItem('lastSeenVersion');
  if (lastSeen !== APP_VERSION) {
    const obActive = document.getElementById('onboardingWizard');
    // Don't interrupt onboarding with the changelog
    if (!obActive || obActive.classList.contains('hidden')) {
      setTimeout(() => {
        if (typeof openWhatsNewModal === 'function') openWhatsNewModal();
      }, 600);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  selectObserver.observe(document.body, { childList: true, subtree: true });
  upgradeSelectsToCustomDropdowns();
  
  if (typeof initOnboarding === 'function') initOnboarding();
  checkVersionAndChangelog();
});
setTimeout(() => {
  selectObserver.observe(document.body, { childList: true, subtree: true });
  upgradeSelectsToCustomDropdowns();
}, 200);
// --- End Custom Select ---
function openExportModal() { document.getElementById('exportModal').style.display='flex'; }
function closeExportModal() { document.getElementById('exportModal').style.display='none'; }
function exportTeacherLoad() {
  document.getElementById('nav-summary').click();
  setTimeout(() => window.print(), 300);
}
function exportConsolidated() {
  alert('To print consolidated programs, ensure you are in the All Programs view before printing.');
  window.print();
}


