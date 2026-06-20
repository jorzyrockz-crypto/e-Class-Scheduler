const PRESENCE_SEEDS = {
  'light': '#006b54',
  'dark': '#10b981',
  'flower-rose': '#e11d48',
  'flower-lavender': '#7c3aed',
  'animal-bear': '#78350f',
  'animal-dolphin': '#0d9488',
  'season-spring': '#65a30d',
  'season-summer': '#d97706',
  'season-autumn': '#c2410c',
  'season-winter': '#0284c7'
};

function initTheme() {
  const savedTheme = localStorage.getItem('appTheme') || 'light';
  const isDark = localStorage.getItem('appDarkMode') === 'true';
  applyTheme(savedTheme, isDark);
}

function applyTheme(themeName, isDark) {
  if (isDark === undefined) isDark = localStorage.getItem('appDarkMode') === 'true';
  else localStorage.setItem('appDarkMode', isDark);

  localStorage.setItem('appTheme', themeName);

  let seedColor = null;
  const hasLogoColor = typeof state !== 'undefined' && state.schoolConfig && state.schoolConfig.logoAccentColor;

  if (themeName === 'logo' || ((themeName === 'light' || themeName === 'dark') && hasLogoColor)) {
    seedColor = state.schoolConfig.logoAccentColor;
  } else if (themeName === 'custom') {
    seedColor = localStorage.getItem('appCustomThemeColor') || '#7c3aed';
  } else {
    seedColor = PRESENCE_SEEDS[themeName] || (isDark ? '#10b981' : '#006b54');
  }

  if (typeof generateDynamicTheme === 'function') {
    generateDynamicTheme(seedColor, isDark);
  }

  if (isDark) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  renderThemeIcon();
}

function openPersonalization() {
  if (typeof openSettings === 'function') {
    activeSettingsTab = 'personalization';
    openSettings();
  }
}

function toggleTheme() {
  const isDark = localStorage.getItem('appDarkMode') === 'true';
  applyTheme(localStorage.getItem('appTheme') || 'light', !isDark);
}

function renderThemeIcon() {
  const iconSpan = document.getElementById('themeIcon');
  if (iconSpan) {
    const isDark = localStorage.getItem('appDarkMode') === 'true';
    iconSpan.innerHTML = isDark ? 
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--text)"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>` : 
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--text)"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  }
}

const BLANK_STATE={"subjects": [], "teachers": [], "classes": [], "advisers": {}, "timeSlots": [], "schoolConfig": {"region": "", "division": "", "district": "", "schoolName": "", "schoolAddress": "", "schoolYear": "", "signatory1Name": "", "signatory1Title": "", "signatory2Name": "", "signatory2Title": "", "schoolType": []}, "grades": ["Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"], "sections": [], "programs": [], "activeProgramId": "", "schedulerExpanded": true, "activeTab": "dashboard", "gradelevelFilter": "Grade 4", "gradelevelDayFilter": "master", "onboardingComplete": false};
function rerunOnboarding() {
  if (typeof state !== 'undefined') {
    state.onboardingComplete = false;
    localStorage.setItem(STORE, JSON.stringify(state));
  }
  const el = document.getElementById('onboardingWizard');
  if (el) {
    el.classList.remove('hidden');
    window._ob = { step:1, dir:'fwd', types: (state.schoolConfig && state.schoolConfig.schoolType) || [], grades:[], sections:{}, subjects:[], teachers:[] };
    if (typeof window._obRenderStep === 'function') window._obRenderStep(1, 'fwd');
    else if (typeof initOnboarding === 'function') initOnboarding();
  }
}
const STORE='class-program-premium-lucide-v1'; const palette=['#f59e0b','#ef4444','#3b82f6','#0f766e','#10b981','#65a30d','#8b5cf6','#0284c7','#64748b','#ec4899'];

const YEAR_KEYS=['backupVersions','subjects','defaultSubjectsInitialized','teachers','classes','advisers','sectionAdvisers','timeSlots','grades','sections','programs','activeProgramId','schedulerExpanded','activeTab','gradelevelFilter','gradelevelDayFilter'];
function clone(v){return JSON.parse(JSON.stringify(v??null))}
function currentSchoolYearName(){let sy=String((typeof state!=='undefined'&&state?.activeSchoolYear)||state?.schoolConfig?.schoolYear||'Current School Year').trim();return sy||'Current School Year'}
function yearSnapshotFrom(s){let d={};YEAR_KEYS.forEach(k=>d[k]=clone(s[k]));d.schoolConfig=clone(s.schoolConfig||{});return d}
function applyYearSnapshot(s,d){if(!d)return;YEAR_KEYS.forEach(k=>{if(d[k]!==undefined)s[k]=clone(d[k])});s.schoolConfig={...(s.schoolConfig||{}),...(d.schoolConfig||{})};s.schoolConfig.schoolYear=s.activeSchoolYear}
function finalizeSchoolYears(s){s.schoolConfig=s.schoolConfig||{};s.schoolYears=s.schoolYears||{};s.migrationHistory=s.migrationHistory||[];let sy=String(s.activeSchoolYear||s.schoolConfig.schoolYear||'Current School Year').trim()||'Current School Year';s.activeSchoolYear=sy;s.schoolConfig.schoolYear=sy;if(!s.schoolYears[sy])s.schoolYears[sy]=yearSnapshotFrom(s);else applyYearSnapshot(s,s.schoolYears[sy]);return s}
function syncActiveSchoolYear(){if(typeof state==='undefined'||!state)return;state.schoolYears=state.schoolYears||{};let sy=currentSchoolYearName();state.activeSchoolYear=sy;state.schoolConfig=state.schoolConfig||{};state.schoolConfig.schoolYear=sy;state.schoolYears[sy]=yearSnapshotFrom(state)}
function availableSchoolYears(){let set=new Set(Object.keys(state.schoolYears||{}));set.add(currentSchoolYearName());return [...set].filter(Boolean).sort().reverse()}
function switchSchoolYear(sy){sy=String(sy||'').trim();if(!sy){toastMsg('Enter a school year first.');return}syncActiveSchoolYear();if(!state.schoolYears[sy]){let blank=clone(BLANK_STATE);blank.activeSchoolYear=sy;blank.schoolConfig={...(state.schoolConfig||{}),schoolYear:sy};state.schoolYears[sy]=yearSnapshotFrom(migrate(blank))}state.activeSchoolYear=sy;applyYearSnapshot(state,state.schoolYears[sy]);state.schoolConfig.schoolYear=sy;activeView=state.activeTab||'dashboard';localStorage.setItem(STORE,JSON.stringify(state));render();toastMsg('School year loaded: '+sy)}
function gradeInMigrationLevel(grade,level){if(level==='All Levels')return true;let g=String(grade||'');if(level==='Elementary')return ['Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10'].includes(g);if(level==='JHS')return ['Grade 7','Grade 8','Grade 9','Grade 10'].includes(g);if(level==='SHS')return ['Grade 11','Grade 12'].includes(g);return false}
function recordMigrationMeta(obj,source,level){obj.migrationLevel=level;obj.sourceSchoolYear=source;obj.migratedAt=new Date().toISOString();return obj}
function ensureTeacherForMigration(srcTeacher,map){if(!srcTeacher)return'';let key=String(srcTeacher.name||'').trim().toLowerCase();let found=state.teachers.find(t=>String(t.name||'').trim().toLowerCase()===key);if(found){map[srcTeacher.id]=found.id;return found.id}let n={...clone(srcTeacher),id:uid('t')};state.teachers.push(n);map[srcTeacher.id]=n.id;return n.id}
function ensureSubjectForMigration(srcSubject,map){if(!srcSubject)return'';let key=String(srcSubject.name||'').trim().toLowerCase();let found=state.subjects.find(s=>String(s.name||'').trim().toLowerCase()===key);if(found){map[srcSubject.id]=found.id;return found.id}let n={...clone(srcSubject),id:uid('s')};state.subjects.push(n);map[srcSubject.id]=n.id;return n.id}
function ensureSectionForMigration(srcSection,map){if(!srcSection)return'';let key=String(srcSection.grade||'')+'|'+String(srcSection.name||'').trim().toLowerCase();let found=state.sections.find(s=>(String(s.grade||'')+'|'+String(s.name||'').trim().toLowerCase())===key);if(found){map[srcSection.id]=found.id;return found.id}let n={...clone(srcSection),id:uid('sec')};state.sections.push(n);map[srcSection.id]=n.id;return n.id}
function clearMigratedLevel(level){state.programs=(state.programs||[]).filter(p=>p.migrationLevel!==level);state.classes=(state.classes||[]).filter(c=>c.migrationLevel!==level);let used=new Set(state.classes.map(c=>c.timeSlotId));state.timeSlots=(state.timeSlots||[]).filter(ts=>ts.migrationLevel!==level||used.has(ts.id));let grades=(state.grades||[]).filter(g=>gradeInMigrationLevel(g,level));grades.forEach(g=>{if(state.advisers&&state.advisers[g]&&state.advisersMigrationLevel&&state.advisersMigrationLevel[g]===level){delete state.advisers[g];delete state.advisersMigrationLevel[g]}})}
function migrateScheduleFromSchoolYear(){let source=(migSourceYear?.value||'').trim(),level=migLevel?.value||'All Levels',target=currentSchoolYearName();if(!source||!state.schoolYears[source]){toastMsg('Select an available source school year.');return}if(source===target){toastMsg('Choose a different source school year.');return}let existing=(state.migrationHistory||[]).find(h=>h.targetSchoolYear===target&&h.level===level&&h.active!==false),msg=`This will migrate ${level} schedule data from ${source} to ${target}.`;if(existing)msg+=` Previous migrated ${level} data in ${target} will be replaced. Other migrated levels will be preserved.`;else msg+=` Existing migrated data from other levels will be preserved.`;askConfirm('Migrate Schedule',msg,()=>runScheduleMigration(source,target,level))}
function runScheduleMigration(source,target,level){syncActiveSchoolYear();let savedSource=clone(state.schoolYears[source]);switchSchoolYear(target);let src=savedSource;if(!src){toastMsg('Source school year not found.');return}clearMigratedLevel(level);let tMap={},sMap={},secMap={},pMap={},tsMap={},now=new Date().toISOString();(src.teachers||[]).forEach(t=>ensureTeacherForMigration(t,tMap));(src.subjects||[]).forEach(s=>ensureSubjectForMigration(s,sMap));(src.sections||[]).filter(sec=>gradeInMigrationLevel(sec.grade,level)).forEach(sec=>ensureSectionForMigration(sec,secMap));let srcPrograms=(src.programs||[]).filter(p=>(p.grades||[]).some(g=>gradeInMigrationLevel(g,level)));srcPrograms.forEach(p=>{let n=recordMigrationMeta({...clone(p),id:uid('prog'),grades:(p.grades||[]).filter(g=>gradeInMigrationLevel(g,level)),sectionIds:(p.sectionIds||[]).map(id=>secMap[id]).filter(Boolean)},source,level);pMap[p.id]=n.id;state.programs.push(n)});let srcClasses=(src.classes||[]).filter(c=>gradeInMigrationLevel(c.grade,level));let neededSlots=new Set(srcClasses.map(c=>c.timeSlotId).filter(Boolean));(src.timeSlots||[]).filter(ts=>neededSlots.has(ts.id)||pMap[ts.programId]).forEach(ts=>{let n=recordMigrationMeta({...clone(ts),id:uid('ts'),programId:pMap[ts.programId]||''},source,level);tsMap[ts.id]=n.id;state.timeSlots.push(n)});srcClasses.forEach(c=>{let n=recordMigrationMeta({...clone(c),id:uid('c'),teacherId:tMap[c.teacherId]||'',subjectId:sMap[c.subjectId]||'',sectionId:secMap[c.sectionId]||'',programId:pMap[c.programId]||'',timeSlotId:tsMap[c.timeSlotId]||c.timeSlotId},source,level);state.classes.push(n)});state.advisersMigrationLevel=state.advisersMigrationLevel||{};(src.grades||[]).filter(g=>gradeInMigrationLevel(g,level)).forEach(g=>{let tid=src.advisers?.[g];if(tid){state.advisers[g]=tMap[tid]||'';state.advisersMigrationLevel[g]=level}});state.migrationHistory=(state.migrationHistory||[]).filter(h=>!(h.targetSchoolYear===target&&h.level===level));state.migrationHistory.push({sourceSchoolYear:source,targetSchoolYear:target,level,migratedAt:now,active:true});syncActiveSchoolYear();localStorage.setItem(STORE,JSON.stringify(state));render();settingsTab('schoolyear');toastMsg(`${level} schedule migrated from ${source}.`)}

let state=migrate(JSON.parse(localStorage.getItem(STORE)||'null')||BLANK_STATE), activeView=state.activeTab||'dashboard', activeGrade=state.gradelevelFilter||'Grade 4', selectedTeacher='', editId=null, editProgramId=null, editSlotId=null, editTeacherId=null, editSubjectId=null, activeSettingsTab='school', dragId=null, dragTeacherId=null, dragProgramId=null, combineBaseProgramId='', currentGroup='g36', pendingConfirm=null, menuRegistry={}, menuCounter=0, activeMenuId=null, closeTimer=null, summarySearch='', summaryLevel='all', summaryStatus='all', summaryAdviser='all', summarySort='advisory';
const VIEWS=[['dashboard','Dashboard','chart','#14b8a6'],['scheduler','Class Scheduler','calendar','#3b82f6'],['summary','Summary','chart','#8b5cf6'],['analytics','Analytics','chart','#0ea5e9']];

initTheme();

