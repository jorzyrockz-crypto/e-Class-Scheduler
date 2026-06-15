const fs = require('fs');
const htmlPath = 'c:\\Users\\ASITSD\\Documents\\GitHub\\e-Class Scheduler\\class_program_scheduler_v2026-06-15_0025_ISSUE15_COLLAPSIBLE_RAIL_PROGRAM_UI.html';
const cssPath = 'c:\\Users\\ASITSD\\Documents\\GitHub\\e-Class Scheduler\\analytics-premium.css';

let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Replace the renderAnalytics line
const oldRender = html.split('\n').find(line => line.includes('function renderAnalytics(){'));
if (!oldRender) {
  console.log('Error: Could not find renderAnalytics');
  process.exit(1);
}

const newRender = oldRender.replace(
  '<p><b>Basis:</b> . Required subjects are listed per grade level, including JHS profiles when Grade 7-10 schedules are encoded. ARAL is shown separately as an intervention block.</p>',
  '<div style="margin-top:12px; display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.15); padding:6px 12px; border-radius:99px; font-size:12px; font-weight:600; cursor:help;" title="Required subjects are listed per grade level. ARAL is shown separately as an intervention block."><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"></circle><path stroke-width="2" d="M12 16v-4M12 8h.01"></path></svg> Basis: </div>'
);

if (oldRender === newRender) {
  console.log('Error: Could not replace the Basis string in renderAnalytics');
  process.exit(1);
}

html = html.replace(oldRender, newRender);

// 2. Replace the old analytics CSS with the premium CSS
const css = fs.readFileSync(cssPath, 'utf8');
const startIdx = html.indexOf('.analyticsPage {');
const endMarker = '.analyticsTimestamp {';
let endIdx = html.indexOf(endMarker, startIdx);
if (startIdx === -1 || endIdx === -1) {
  console.log('Error: Could not find CSS boundaries');
  process.exit(1);
}

// find the closing brace of .analyticsTimestamp
endIdx = html.indexOf('}', endIdx) + 1;

const beforeCss = html.slice(0, startIdx);
const afterCss = html.slice(endIdx);
html = beforeCss + css + afterCss;

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Success');
