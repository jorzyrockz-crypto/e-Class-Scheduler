document.addEventListener('DOMContentLoaded', () => {
  selectObserver.observe(document.body, { childList: true, subtree: true });
  upgradeSelectsToCustomDropdowns();
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


