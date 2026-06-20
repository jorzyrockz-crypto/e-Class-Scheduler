const APP_VERSION = "1.8.0";

const CHANGELOG = [
  {
    version: "1.8.0",
    date: "June 21, 2026",
    changes: [
      { type: "Improved", text: "Redesigned the Class Matrix to a highly-structured 'boxed' layout: separated Time into distinct 'TIME SLOT' and 'MINS' columns, and removed avatars from column headers for a cleaner aesthetic." },
      { type: "Improved", text: "Overhauled the Class Card design: class cards are now fully bordered in their subject color. The top Grade pill was removed to reduce redundancy, teacher avatars were swapped for simple icons, and the footer now features the Teacher's Position in a solid pill and Room assignments in a smart outlined container." },
      { type: "Improved", text: "Enhanced Custom Subject Colors: the system no longer defaults custom subjects to slate gray. Instead, it deterministically assigns each custom subject a guaranteed unique, vibrant color that does not clash with core subject colors." },
      { type: "Improved", text: "Streamlined the Class Program header by hiding the 'Advisory Assignments' list." }
    ]
  },
  {
    version: "1.7.0",
    date: "June 20, 2026",
    changes: [
      { type: "New", text: "Implemented a dynamic Android-style theming engine (Material You) that generates full tonal light and dark palettes from a seed color." },
      { type: "New", text: "Added support for styling the app dynamically based on the uploaded school logo identity or a custom hex color picker." },
      { type: "Improved", text: "Polished the light mode background to be more colorful by boosting saturation derived from the seed theme color." },
      { type: "Improved", text: "Increased workspace horizontal padding from 16px to 48px to prevent content from stretching too wide on large screens." }
    ]
  },
  {
    version: "1.6.18",
    date: "June 20, 2026",
    changes: [
      { type: "Improved", text: "Transformed the sidebar toggle behavior! Instead of completely disappearing, toggling the sidebar now gracefully collapses it into a sleek 'mini' state that displays only the navigation icons." }
    ]
  },
  {
    version: "1.6.17",
    date: "June 20, 2026",
    changes: [
      { type: "Improved", text: "Moved the 'Re-run Setup Wizard' button from the Settings menu to the Reset menu for better discoverability and organization." }
    ]
  },
  {
    version: "1.6.16",
    date: "June 20, 2026",
    changes: [
      { type: "Fixed", text: "Fixed an issue in Dark Mode where Class Program cards had blindingly white backgrounds, making text unreadable. Cards now properly adapt to the dark theme." }
    ]
  },
  {
    version: "1.6.15",
    date: "June 20, 2026",
    changes: [
      { type: "Fixed", text: "Resolved an issue where the dashboard content was being clipped at the bottom by removing the inner fixed-height scrolling box and enabling full-page scrolling." }
    ]
  },
  {
    version: "1.6.14",
    date: "June 20, 2026",
    changes: [
      { type: "Improved", text: "Refreshed the dashboard layout for a modern, container-less aesthetic! Removed the outer bounding boxes from the main schedule and workload panels, and subtly deepened the background contrast to make white cards pop beautifully." }
    ]
  },
  {
    version: "1.6.13",
    date: "June 20, 2026",
    changes: [
      { type: "Improved", text: "Enhanced the image cropping tool! Added a circular guide overlay for framing circular logos, expanded touch target handles to 40px for mobile devices, and fixed an alignment bug for non-square images." }
    ]
  },
  {
    version: "1.6.12",
    date: "June 20, 2026",
    changes: [
      { type: "New", text: "Integrated the uploaded school logo's accent color into Dark Mode! The color is now dynamically adapted using HSL space to ensure high contrast and legibility under both Light and Dark themes." }
    ]
  },
  {
    version: "1.6.11",
    date: "June 20, 2026",
    changes: [
      { type: "Improved", text: "Cleaned up the codebase by removing obsolete, unused scratch files and stylesheets from the root directory." }
    ]
  },
  {
    version: "1.6.10",
    date: "June 20, 2026",
    changes: [
      { type: "Fixed", text: "Clicking 'Finish Setup' now immediately closes the wizard and initializes the dashboard without requiring an extra click on the Done screen." }
    ]
  },
  {
    version: "1.6.9",
    date: "June 20, 2026",
    changes: [
      { type: "Fixed", text: "Fixed an issue where completing the Onboarding Wizard did not properly close the UI and initialize the dashboard." }
    ]
  },
  {
    version: "1.6.8",
    date: "Oct 26, 2023",
    changes: [
      { type: "Fixed", text: "Ensured Onboarding Wizard reliably shows after resetting all data to blank." }
    ]
  },
  {
    version: "1.6.7",
    date: "June 20, 2026",
    changes: [
      { type: "Removed", text: "Removed the 'Time Slot Group' dropdown from the Add/Edit Class Program modal. Time slots are now fully managed from the schedule matrix directly." }
    ]
  },
  {
    version: "1.6.6",
    date: "June 20, 2026",
    changes: [
      { type: "Fixed", text: "After resetting to blank, the header no longer shows the old school name, division, or district. It now correctly shows generic placeholder text." }
    ]
  },
  {
    version: "1.6.5",
    date: "June 20, 2026",
    changes: [
      { type: "Fixed", text: "Refreshing the page mid-onboarding now correctly keeps you in the Onboarding Wizard instead of jumping to the main UI." },
      { type: "Fixed", text: "Reset to Blank now fully wipes all historical school year snapshots so the Onboarding Wizard reliably opens after a reset." }
    ]
  },
  {
    version: "1.6.2",
    date: "June 20, 2026",
    changes: [
      { type: "Fixed", text: "Fixed infinite loop bug where the Check for Updates modal would continuously pop up even after applying the update." },
      { type: "Fixed", text: "Fixed an issue where resetting the app to blank would not immediately trigger the Onboarding Wizard popup." }
    ]
  },
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
        if (sessionStorage.getItem('justUpdated') === 'true') {
          sessionStorage.removeItem('justUpdated');
          if (typeof openWhatsNewModal === 'function') openWhatsNewModal();
        } else {
          if (typeof checkForUpdatesFlow === 'function') checkForUpdatesFlow();
        }
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

// Fallback to ensure onboarding runs even if DOMContentLoaded is missed
setTimeout(() => {
  if (typeof state !== 'undefined' && state && state.onboardingComplete !== true) {
    const el = document.getElementById('onboardingWizard');
    if (el && el.classList.contains('hidden')) {
      if (typeof initOnboarding === 'function') initOnboarding();
    }
  }
}, 500);
setTimeout(() => {
  selectObserver.observe(document.body, { childList: true, subtree: true });
  upgradeSelectsToCustomDropdowns();
}, 200);
// --- End Custom Select ---


