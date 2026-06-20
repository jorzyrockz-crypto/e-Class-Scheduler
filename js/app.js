const APP_VERSION = "1.6.0";

const CHANGELOG = [
  {
    version: "1.6.0",
    date: "June 20, 2026",
    changes: [
      { type: "New", text: "Decoupled Dark Mode from the Theme Engine. You can now toggle Dark Mode independently from your chosen Personalization Theme!" },
      { type: "Improved", text: "The Top Header now features both a Dark Mode toggle (Sun/Moon icon) and a Personalization Palette icon side-by-side for instant access." },
      { type: "Fixed", text: "Fixed an issue where the KPI cards on the dashboard would wrap to a second row on large screens." }
    ]
  },
  {
    version: "1.5.0",
    date: "June 20, 2026",
    changes: [
      { type: "Improved", text: "Dashboard decluttered! The large Setup Readiness Checklist has been cleanly integrated into the Schedule Health Diagnostics." },
      { type: "New", text: "The Schedule Health Monitor is now smarter! It will prompt you for missing setup items (like no teachers or no class programs) before checking for double-bookings." },
      { type: "Improved", text: "Added a new 'Class Programs' KPI card to the dashboard row to replace the visual weight of the old checklist." }
    ]
  },
  {
    version: "1.4.0",
    date: "June 20, 2026",
    changes: [
      { type: "New", text: "Added a massive Global Personalization Engine! You can now choose between 10 beautiful, cohesive themes including Flower, Animal, and Seasonal palettes." },
      { type: "New", text: "Added an automated Color Extraction feature. The system now intelligently scans your uploaded school logo and applies its dominant color as the global accent color for the default Light and Dark themes!" },
      { type: "Improved", text: "The Dark/Light top-bar toggle has been upgraded to a 'Personalization' palette icon that opens the new theme selection grid." }
    ]
  },
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
        if (typeof checkForUpdatesFlow === 'function') checkForUpdatesFlow();
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


