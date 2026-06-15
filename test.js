
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  renderThemeIcon();
}
function renderThemeIcon() {
  const isDark = document.body.classList.contains('dark-theme');
  const iconSpan = document.getElementById('themeIcon');
  if (iconSpan) {
    iconSpan.innerHTML = isDark 
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke:#fbbf24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--text)"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  }
}
initTheme();
const BLANK_STATE={"subjects": [], "teachers": [], "classes": [], "advisers": {}, "timeSlots": [], "schoolConfig": {"region": "", "division": "", "district": "", "schoolName": "", "schoolAddress": "", "schoolYear": "", "signatory1Name": "", "signatory1Title": "", "signatory2Name": "", "signatory2Title": ""}, "grades": ["Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"], "sections": [], "programs": [], "activeProgramId": "", "schedulerExpanded": true, "activeTab": "dashboard", "gradelevelFilter": "Grade 4", "gradelevelDayFilter": "master"}; const STORE='class-program-premium-lucide-v1'; const palette=['#f59e0b','#ef4444','#3b82f6','#0f766e','#10b981','#65a30d','#8b5cf6','#0284c7','#64748b','#ec4899'];

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
function ico(name,color='#2563eb'){const common=`fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;const m={calendar:`<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>`,users:`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,book:`<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>`,alert:`<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>`,clock:`<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>`,plus:`<path d="M12 5v14M5 12h14"/>`,settings:`<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1H4a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.37.36.7.6 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-.6 1z"/>`,download:`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>`,upload:`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>`,printer:`<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>`,baby:`<circle cx="12" cy="10" r="5"/><path d="M12 15v7M9 19h6"/>`,chart:`<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-7"/>`,refresh:`<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>`,search:`<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,'chevron-left':`<path d="m15 18-6-6 6-6"/>`,'chevron-right':`<path d="m9 18 6-6-6-6"/>`,coffee:`<path d="M17 8h1a4 4 0 1 1 0 8h-1M2 8h15v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/>`,flag:`<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>`,home:`<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,grid:`<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>`,list:`<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/>`};return `<svg viewBox="0 0 24 24" ${common}>${m[name]||m.calendar}</svg>`}
function universalActivityHtml(label){let clean=String(label||'').trim();let text=clean.toUpperCase();let iconName='clock';if(text.includes('BREAK')||text.includes('RECESS')||text.includes('LUNCH')||text.includes('MEAL')){iconName='coffee';}else if(text.includes('FLAG')||text.includes('CEREMONY')||text.includes('LOWERING')){iconName='flag';}else if(text.includes('DISMISSAL')||text.includes('WRAP')||text.includes('HOME')){iconName='home';}else if(text.includes('NAP')||text.includes('QUIET')||text.includes('REST')){iconName='baby';}
return `<div class="univ">${ico(iconName,'currentColor')}<span>${esc(clean||'Universal Activity')}</span></div>`}
function hydrateStaticIcons(){if(typeof iSettings!=='undefined')iSettings.innerHTML=ico('settings','currentColor');if(typeof iReset!=='undefined')iReset.innerHTML=ico('refresh','currentColor');if(typeof iExport!=='undefined')iExport.innerHTML=ico('download','currentColor');if(typeof iImport!=='undefined')iImport.innerHTML=ico('upload','currentColor');if(typeof iPlus!=='undefined')iPlus.innerHTML=ico('plus','currentColor');if(typeof iPrint!=='undefined')iPrint.innerHTML=ico('printer','currentColor');if(typeof iTopCalendar!=='undefined')iTopCalendar.innerHTML=ico('calendar','currentColor');if(typeof iTopExport!=='undefined')iTopExport.innerHTML=ico('download','currentColor');if(typeof iFaculty!=='undefined')iFaculty.innerHTML=ico('users','currentColor');if(typeof iDiag!=='undefined')iDiag.innerHTML=ico('alert','currentColor')}
function uid(p){return p+'-'+Math.random().toString(36).slice(2,9)} function teacherColor(c){const map={yellow:'#f59e0b',orange:'#f97316',blue:'#3b82f6',teal:'#0f766e',emerald:'#10b981',lime:'#65a30d',purple:'#8b5cf6',sky:'#0284c7',slate:'#64748b'};c=typeof c==='object'?(c.color||'#64748b'):c;return /^#([0-9A-F]{3}){1,2}$/i.test(c)?c:(map[c]||'#64748b')}
function addMins(t,m){let [h,mi]=(t||'07:30').split(':').map(Number),x=(h*60+mi+Number(m||0))%1440;return `${String(Math.floor(x/60)).padStart(2,'0')}:${String(x%60).padStart(2,'0')}`} function mins(a,b){let[h1,m1]=a.split(':').map(Number),[h2,m2]=b.split(':').map(Number),x=h1*60+m1,y=h2*60+m2;if(y<x)y+=1440;return y-x} function to12(t){if(!t)return'';let[h,m]=t.split(':').map(Number),ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${String(m).padStart(2,'0')} ${ap}`}

/* Time Slot Group normalization + starter presets */
function normGroup(g){g=String(g||'g36').toLowerCase().replace(/[–—]/g,'-').trim();if(g.includes('kinder'))return'kinder';if(g.includes('1')&&g.includes('2'))return'g12';if(g.includes('3')&&g.includes('6'))return'g36';if(['all','kinder','g12','g36'].includes(g))return g;return'g36'}
function defaultStartForGroup(g){g=normGroup(g);return '07:30'}
const DEFAULT_SUBJECT_NAMES=['FILIPINO','SCIENCE','MATH','MATHEMATICS','ENGLISH','AP','ARALING PANLIPUNAN','EPP','TLE','EPP / TLE','ESP','VALUES EDUCATION','GMRC','GMRC (4 DAYS) / HGP (1 DAY)','MAKABANSA','ARAL PROGRAM','ARAL READING','ARAL MATHEMATICS','ARAL SCIENCE','HGP','HOMEROOM GUIDANCE','MAPEH','MUSIC AND ARTS','PE AND HEALTH','MEETING TIME I','CIRCLE TIME I','QUIET / NAP TIME','CIRCLE TIME II','INDOOR / OUTDOOR PLAY','WRAP-UP TIME','LANGUAGE','READING AND LITERACY'];
function ensureDefaultSubjects(){if(state.defaultSubjectsInitialized)return;let existing=new Set(state.subjects.map(s=>String(s.name||'').trim().toLowerCase()));DEFAULT_SUBJECT_NAMES.forEach(n=>{if(!existing.has(n.toLowerCase())){state.subjects.push({id:uid('s'),name:n,tags:[]});existing.add(n.toLowerCase())}});state.defaultSubjectsInitialized=true}
function presetSlotsForGroup(g){g=normGroup(g);let rows=g==='kinder'?[['07:30',15,''],['07:45',45,''],['08:30',15,'SUPERVISED RECESS','universal'],['08:45',10,'QUIET / NAP TIME','universal'],['08:55',40,''],['09:35',35,''],['10:10',20,''],['10:30',10,'DISMISSAL TIME','universal']]:g==='g12'?[['07:30',60,''],['08:30',40,''],['09:10',10,'HEALTH BREAK','universal'],['09:20',40,''],['10:00',40,''],['10:40',40,''],['11:20',40,''],['12:00',60,'HEALTH BREAK (LUNCH)','universal'],['13:00',40,''],['13:40',40,'']]:[['07:20',10,'FLAG CEREMONY','universal','all'],['07:30',60,''],['08:30',45,''],['09:15',10,'HEALTH BREAK','universal'],['09:25',45,''],['10:10',45,''],['10:55',45,''],['11:40',80,'HEALTH BREAK (LUNCH)','universal'],['13:00',40,''],['13:40',40,''],['14:20',40,''],['15:00',40,''],['15:40',20,'FLAG LOWERING','universal','all']];return rows.map((r)=>{let group=r[4]||g,type=r[3]||'academic',start=r[0],mins=Number(r[1]);return{id:uid('ts'),start,mins,end:addMins(start,mins),label:r[2]||'',type,group}})}
function ensureGroupDefaults(group){group=normGroup(group);ensureDefaultSubjects();let hasGroup=state.timeSlots.some(ts=>normGroup(ts.group)===group||normGroup(ts.group)==='all');if(!hasGroup){state.timeSlots.push(...presetSlotsForGroup(group));toastMsg(`Default ${group==='kinder'?'Kindergarten':group==='g12'?'Grades 1–2':'Grades 3–6'} time blocks and subjects loaded.`)}}
function migrate(s){s=JSON.parse(JSON.stringify(s||{}));s.subjects||=[];s.defaultSubjectsInitialized=!!s.defaultSubjectsInitialized||s.subjects.length>0;s.teachers||=[];s.classes||=[];s.timeSlots||=[];s.grades||=['Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10'];s.sections||=[];s.programs||=[];s.activeProgramId||='';if(typeof s.schedulerExpanded!=='boolean')s.schedulerExpanded=true;if(!['dashboard','scheduler','summary','analytics'].includes(s.activeTab))s.activeTab='dashboard';s.advisers||={};s.sectionAdvisers||={};s.schoolConfig||={};s.subjects=s.subjects.map(x=>({id:x.id||uid('s'),name:x.name||'NEW SUBJECT',tags:Array.isArray(x.tags)?x.tags:[]}));s.teachers=s.teachers.map((t,i)=>({...t,position:t.position||'',room:t.room||'',color:teacherColor(t.color||palette[i%palette.length])}));s.classes=s.classes.map(c=>({id:c.id||uid('c'),subjectId:c.subjectId||'',teacherId:c.teacherId||'',grade:c.grade||'Grade 3',timeSlotId:c.timeSlotId||'',day:c.day||'master',sectionId:c.sectionId||'',programId:c.programId||''}));s.timeSlots=s.timeSlots.map(ts=>{let m=Number(ts.mins)||mins(ts.start||'07:30',ts.end||'08:10'),start=ts.start||'07:30';return {id:ts.id||uid('ts'),start,mins:m,end:addMins(start,m),label:ts.label||'',type:ts.type||'academic',group:normGroup(ts.group||'g36'),programId:ts.programId||''}});s.programs=s.programs.map((p,i)=>({id:p.id||uid('prog'),name:p.name||'Class Program',type:p.type||'single',grades:Array.isArray(p.grades)?p.grades:[],useSections:!!p.useSections,sectionIds:Array.isArray(p.sectionIds)?p.sectionIds:[],group:normGroup(p.group||'g36'),advisers:Array.isArray(p.advisers)?p.advisers:[],order:Number.isFinite(Number(p.order))?Number(p.order):i,countsTowardLoad:p.countsTowardLoad!==false,viewType:p.viewType||((p.countsTowardLoad===false)?'learner':'master')}));if(!s.programs.length&&(s.classes.length||s.timeSlots.length)){s.programs=[{id:'prog-kinder',name:'Kindergarten Program',type:'kindergarten',grades:['Kindergarten'],useSections:false,sectionIds:[],group:'kinder',advisers:[],order:0,countsTowardLoad:true,viewType:'master'},{id:'prog-g12',name:'Grades 1–2 Program',type:'custom',grades:['Grade 1','Grade 2'],useSections:false,sectionIds:[],group:'g12',advisers:[],order:1,countsTowardLoad:true,viewType:'master'},{id:'prog-g36',name:'Grades 3–6 Program',type:'custom',grades:['Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10'],useSections:false,sectionIds:[],group:'g36',advisers:[],order:2,countsTowardLoad:true,viewType:'master'}]};if(s.programs.length){s.classes=s.classes.map(c=>{if(c.programId&&s.programs.some(p=>p.id===c.programId))return c;let sl=s.timeSlots.find(ts=>ts.id===c.timeSlotId)||{};let p=s.programs.find(p=>p.id===s.activeProgramId&&(p.grades||[]).includes(c.grade)&&(p.group===sl.group||sl.group==='all'))||s.programs.find(p=>(p.grades||[]).includes(c.grade)&&(p.group===sl.group||sl.group==='all'))||s.programs.find(p=>p.id===s.activeProgramId&&(p.grades||[]).includes(c.grade))||s.programs.find(p=>(p.grades||[]).includes(c.grade));return {...c,programId:p?p.id:''}})};return finalizeSchoolYears(s)}
let undoStack = [];
let redoStack = [];
let lastSavedStateStr = typeof state !== 'undefined' ? JSON.stringify(state) : '{}';

function save(skipHistory = false){
  const currentStateStr = JSON.stringify(state);
  if (!skipHistory && currentStateStr !== lastSavedStateStr) {
    undoStack.push(lastSavedStateStr);
    if (undoStack.length > 50) undoStack.shift();
    redoStack = [];
  }
  lastSavedStateStr = currentStateStr;
  syncActiveSchoolYear();
  localStorage.setItem(STORE,currentStateStr);
  render();
  showAutoSaveIndicator();
}

function undo() {
  if (undoStack.length === 0) {
    toastMsg('Nothing to undo.');
    return;
  }
  redoStack.push(JSON.stringify(state));
  state = migrate(JSON.parse(undoStack.pop()));
  save(true);
  toastMsg('Undo action.');
}

function redo() {
  if (redoStack.length === 0) {
    toastMsg('Nothing to redo.');
    return;
  }
  undoStack.push(JSON.stringify(state));
  state = migrate(JSON.parse(redoStack.pop()));
  save(true);
  toastMsg('Redo action.');
}

let autoSaveTimeout = null;
function showAutoSaveIndicator() {
  const ind = document.getElementById('autoSaveIndicator');
  if (ind) {
    ind.classList.add('saved');
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      ind.classList.remove('saved');
    }, 1500);
  }
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  const undoB = document.getElementById('undoBtn');
  const redoB = document.getElementById('redoBtn');
  if (undoB) undoB.disabled = (undoStack.length === 0);
  if (redoB) redoB.disabled = (redoStack.length === 0);
}

function get(a,id){return a.find(x=>x.id===id)||{name:'—',color:'#64748b'}} function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))} function rgba(hex,a){hex=teacherColor(hex).replace('#','');if(hex.length===3)hex=hex.split('').map(x=>x+x).join('');let r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);return `rgba(${r},${g},${b},${a})`} function initials(n){return String(n||'').split(/\s+/).filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase()}
function toggleFocusMode() {
  document.body.classList.toggle('focusMode');
  render();
}
function render(){hideContextMenu();menuRegistry={};menuCounter=0;renderHead();renderNav();renderSchedulerRail();renderMetrics();renderFaculty();renderDiag();populateModal();renderContent();applyLayoutMode();hydrateStaticIcons();renderThemeIcon();applySearch();updateUndoRedoButtons();} function applyLayoutMode(){let g=document.querySelector('.grid');g?.classList.toggle('full',activeView!=='scheduler'||!state.activeProgramId);g?.classList.toggle('dashboardView',activeView==='dashboard');g?.classList.toggle('analyticsView',activeView==='analytics');g?.classList.toggle('schedulerView',activeView==='scheduler');document.querySelector('.kpis')?.classList.toggle('hideForAnalytics',activeView==='analytics' || activeView==='dashboard' || activeView==='scheduler');document.querySelector('.shell')?.classList.toggle('schedulerRailMode',activeView==='scheduler');let rail=document.getElementById('schedulerRail');rail?.classList.toggle('visible',activeView==='scheduler');rail?.classList.toggle('collapsed',activeView==='scheduler'&&!!state.schedulerRailCollapsed);document.querySelector('.shell')?.classList.toggle('schedulerRailCollapsed',activeView==='scheduler'&&!!state.schedulerRailCollapsed)} function formatSchoolYearLabel(sy){sy=String(sy||'').trim();if(!sy)return 'No school year set';return /^S\.?Y\.?/i.test(sy)?sy:'S.Y. '+sy}
function toggleSchoolYearDropdown(e){e.stopPropagation();let wrap=document.getElementById('topSchoolYearDropdown'),menu=document.getElementById('topSchoolYearMenu');if(wrap&&menu){let show=menu.classList.toggle('show');wrap.classList.toggle('active',show)}}
function renderTopSchoolYearDropdown(){let menu=document.getElementById('topSchoolYearMenu'),label=document.getElementById('topSchoolYearLabel');if(!menu||!label)return;let years=availableSchoolYears(),current=currentSchoolYearName();if(!years.includes(current))years.unshift(current);label.textContent=formatSchoolYearLabel(current);let html=years.map(y=>`<button class="topSyMenuItem ${y===current?'active':''}" onclick="handleTopSchoolYearChange('${esc(y)}')">${esc(formatSchoolYearLabel(y))}</button>`).join('');html+=`<button class="topSyMenuItem addMenuBtn" onclick="handleTopSchoolYearChange('__add_new_sy__')">＋ Add New School Year</button>`;menu.innerHTML=html}
function handleTopSchoolYearChange(value){let wrap=document.getElementById('topSchoolYearDropdown'),menu=document.getElementById('topSchoolYearMenu');if(wrap&&menu){menu.classList.remove('show');wrap.classList.remove('active')}if(value==='__add_new_sy__'){let sy=prompt('Enter new school year, e.g. 2027–2028');if(!sy){renderTopSchoolYearDropdown();return}switchSchoolYear(sy.trim());return}switchSchoolYear(value)}
function renderHead(){let sc=state.schoolConfig;let title=(sc.schoolName||'OQUENDO ELEMENTARY SCHOOL').toUpperCase();let sy=sc.schoolYear||state.activeSchoolYear||currentSchoolYearName();schoolName.textContent=title;schoolMeta.textContent=`${sc.division||'Division of Aklan'} • ${sc.district||'District of Balete'} • ${formatSchoolYearLabel(sy)}`;renderSchoolLogo();renderTopSchoolYearDropdown()} function programBadge(type){return type==='multigrade'?'MG':type==='multi_section'?'SEC':type==='kindergarten'?'K':''}
function sortedPrograms(){return [...(state.programs||[])].sort((a,b)=>(Number.isFinite(Number(a.order))?Number(a.order):9999)-(Number.isFinite(Number(b.order))?Number(b.order):9999)||String(a.name||'').localeCompare(String(b.name||'')))}
function normalizeProgramOrder(){sortedPrograms().forEach((p,i)=>p.order=i)}
function programGradeSort(a,b){return state.grades.indexOf(a)-state.grades.indexOf(b)}
function programGradesLabel(grades){return (grades||[]).slice().sort(programGradeSort).join(', ')}
function classCountsTowardLoad(c){let p=state.programs.find(x=>x.id===c.programId);return !p||p.countsTowardLoad!==false}
function activeProgramCountsLoad(){let p=activeProgram();return !p||p.countsTowardLoad!==false}
function workloadSourceClasses(){return state.classes.filter(classCountsTowardLoad)}
function programLoadBadge(p){return `<span class="programLoadPill ${p.countsTowardLoad===false?'displayOnly':'counted'}">${p.countsTowardLoad===false?'Display Only':'Load Counted'}</span>`}
function eyeSvg(open=true){return open?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"></path><path d="M10.6 10.6A3 3 0 0 0 13.4 13.4"></path><path d="M9.9 4.24A10.7 10.7 0 0 1 12 4c6 0 10 8 10 8a18.7 18.7 0 0 1-3.1 4.17"></path><path d="M6.53 6.53A18.9 18.9 0 0 0 2 12s4 8 10 8a10.5 10.5 0 0 0 5.47-1.53"></path></svg>`}
function programEyeTitle(p){return p.countsTowardLoad===false?'Display Only. Click to count in Teaching Load.':'Counted in Teaching Load. Click to set as Display Only.'}
function toggleProgramLoad(id){let p=state.programs.find(x=>x.id===id);if(!p)return;p.countsTowardLoad=p.countsTowardLoad===false?true:false;p.viewType=p.countsTowardLoad?'master':'learner';toastMsg(`${p.name} set to ${p.countsTowardLoad?'Load Counted':'Display Only'}.`);save()}
function programEyeToggle(p){return `<span class="programEyeToggle" title="${esc(programEyeTitle(p))}" onclick="event.stopPropagation();toggleProgramLoad('${p.id}')">${eyeSvg(p.countsTowardLoad!==false)}</span>`}

function moveProgram(id,dir){normalizeProgramOrder();let arr=sortedPrograms(),i=arr.findIndex(p=>p.id===id),j=i+dir;if(i<0||j<0||j>=arr.length)return;let oi=arr[i].order;arr[i].order=arr[j].order;arr[j].order=oi;save()}
function dragProgram(e,id){dragProgramId=id;dragId=null;dragTeacherId=null;hideContextMenu();e.currentTarget.classList.add('dragging');e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',id)}catch(err){}}
function allowProgramDrop(e,id){if(!dragProgramId||dragProgramId===id)return;e.preventDefault();e.currentTarget.classList.add('programDragOver')}
function leaveProgramDrop(e){e.currentTarget.classList.remove('programDragOver')}
function dropProgram(e,targetId){e.preventDefault();e.currentTarget.classList.remove('programDragOver');document.querySelectorAll('.subitemRow.dragging').forEach(el=>el.classList.remove('dragging'));let sourceId=dragProgramId;dragProgramId=null;if(!sourceId||sourceId===targetId)return;normalizeProgramOrder();let arr=sortedPrograms(),sourceIndex=arr.findIndex(p=>p.id===sourceId),targetIndex=arr.findIndex(p=>p.id===targetId);if(sourceIndex<0||targetIndex<0)return;let [moved]=arr.splice(sourceIndex,1);if(sourceIndex<targetIndex)targetIndex--;arr.splice(targetIndex,0,moved);arr.forEach((p,i)=>p.order=i);save()}
function endProgramDrag(e){dragProgramId=null;e.currentTarget.classList.remove('dragging');document.querySelectorAll('.subitemRow.programDragOver').forEach(el=>el.classList.remove('programDragOver'))}
function cloneProgramSlotsTo(sourceProgramId,targetProgramId){let map={};state.timeSlots.filter(ts=>ts.programId===sourceProgramId).forEach(ts=>{let n={...ts,id:uid('ts'),programId:targetProgramId};state.timeSlots.push(n);map[ts.id]=n.id});return map}
function splitProgramClasses(programId){let p=state.programs.find(x=>x.id===programId);if(!p){toastMsg('Class program not found.');return}let grades=(p.grades||[]).slice().sort(programGradeSort);if(grades.length<=1){toastMsg('This class program has only one grade and cannot be split.');return}let sourceClasses=state.classes.filter(c=>c.programId===p.id||classBelongsToProgram(c,p));askConfirm('Split Classes',`This will create learner-facing class programs from “${p.name}”. Subjects, teachers, rooms, and time slots will be copied exactly. New learner programs will be Display Only and will not count again in Teaching Load Summary. Continue?`,()=>{normalizeProgramOrder();let baseOrder=Number.isFinite(Number(p.order))?Number(p.order):state.programs.length,newPrograms=[],slotMaps={};grades.forEach((grade,idx)=>{let id=uid('prog'),secs=(p.sectionIds||[]).filter(sid=>get(state.sections,sid).grade===grade),np={id,name:`${grade} Learner Program`,type:grade==='Kindergarten'?'kindergarten':'single',grades:[grade],useSections:!!(p.useSections&&secs.length),sectionIds:secs,group:normGroup(p.group||defaultGroupForGrade(grade)),advisers:(p.advisers||[]).map(a=>({...a,id:a.id||uid('adv')})),order:baseOrder+idx/100,countsTowardLoad:false,viewType:'learner'};newPrograms.push(np);slotMaps[id]=cloneProgramSlotsTo(p.id,id)});sourceClasses.forEach(c=>{let np=newPrograms.find(x=>(x.grades||[]).includes(c.grade));if(np){let nc={...c,id:uid('c'),programId:np.id};if(slotMaps[np.id]&&slotMaps[np.id][c.timeSlotId])nc.timeSlotId=slotMaps[np.id][c.timeSlotId];state.classes.push(nc)}});state.programs=state.programs.concat(newPrograms);normalizeProgramOrder();toastMsg('Learner class programs created. Original master program remains counted for teaching load.');save()})}
function openCombineProgramModal(baseId){combineBaseProgramId=baseId||'';let base=state.programs.find(p=>p.id===baseId),programs=sortedPrograms();combineName.value=base?`${base.name} Master`:'Combined Master Class Program';combineCountLoad.checked=true;combineProgramList.innerHTML=programs.map(p=>`<label class="combineProgramLine"><input type="checkbox" value="${p.id}" ${p.id===baseId?'checked':''}> <span>${esc(p.name)}</span><span class="muted" style="margin-left:auto">${esc(programGradesLabel(p.grades)||'No grades')} • ${p.countsTowardLoad===false?'Display Only':'Load Counted'}</span></label>`).join('')||'<div class="muted">No class programs available.</div>';combineModal.classList.add('show')}
function closeCombineModal(){combineModal.classList.remove('show');combineBaseProgramId=''}
function saveCombineClasses(){let ids=[...combineProgramList.querySelectorAll('input:checked')].map(i=>i.value),selected=ids.map(id=>state.programs.find(p=>p.id===id)).filter(Boolean);if(selected.length<2){toastMsg('Select at least two class programs to combine.');return}let grades=[...new Set(selected.flatMap(p=>p.grades||[]))].sort(programGradeSort),sectionIds=[...new Set(selected.flatMap(p=>p.sectionIds||[]))],advisers=[],advSeen=new Set();selected.forEach(p=>(p.advisers||[]).forEach(a=>{let key=String((a.name||'')+'|'+(a.title||'')).toLowerCase();if(a.name&&!advSeen.has(key)){advSeen.add(key);advisers.push({...a,id:a.id||uid('adv')})}}));let newId=uid('prog'),name=(combineName.value||'').trim()||`${programGradesLabel(grades)||'Combined'} Master Program`,group=normGroup(selected[0].group||defaultGroupForGrade(grades[0])),order=Math.min(...selected.map(p=>Number.isFinite(Number(p.order))?Number(p.order):9999));let newProgram={id:newId,name,type:'custom',grades,useSections:selected.some(p=>p.useSections),sectionIds,group,advisers,order,countsTowardLoad:combineCountLoad.checked,viewType:combineCountLoad.checked?'master':'learner'};let slotIdMap={},slotKeyMap={};selected.forEach(p=>state.timeSlots.filter(ts=>ts.programId===p.id).forEach(ts=>{let key=[ts.start,ts.mins,ts.label||'',ts.type||'academic',normGroup(ts.group||group)].join('|');if(!slotKeyMap[key]){let n={...ts,id:uid('ts'),programId:newId,group:normGroup(ts.group||group)};state.timeSlots.push(n);slotKeyMap[key]=n.id}slotIdMap[ts.id]=slotKeyMap[key]}));let sourceClasses=state.classes.filter(c=>ids.includes(c.programId)||selected.some(p=>classBelongsToProgram(c,p)));sourceClasses.forEach(c=>{let nc={...c,id:uid('c'),programId:newId};if(slotIdMap[c.timeSlotId])nc.timeSlotId=slotIdMap[c.timeSlotId];state.classes.push(nc)});selected.forEach(p=>{p.countsTowardLoad=false;p.viewType='learner'});state.programs.push(newProgram);normalizeProgramOrder();state.activeProgramId=newId;activeView='scheduler';state.activeTab='scheduler';closeCombineModal();toastMsg('Combined master program created. Source programs were set to Display Only.');save()}

function openDashboard(){activeView='dashboard';state.activeTab='dashboard';save()}
function toggleScheduler(){state.schedulerExpanded=!state.schedulerExpanded;state.activeProgramId='';activeView='scheduler';state.activeTab='scheduler';save()}
function openSchedulerHome(){activeView='scheduler';state.activeTab='scheduler';state.activeProgramId='';save()}
function openSummaryView(){activeView='summary';state.activeTab='summary';save()}
function openAnalyticsView(){activeView='analytics';state.activeTab='analytics';save()}
function goAnalytics(){activeView='analytics';state.activeTab='analytics';save()}
function schedulerFilterDefault(){return state.schedulerProgramFilter||'all'}
function setSchedulerFilter(filter){state.schedulerProgramFilter=filter||'all';state.activeProgramId='';activeView='scheduler';state.activeTab='scheduler';save()}
function setSchedulerSearch(q){state.schedulerProgramSearch=String(q||'');state.activeProgramId='';activeView='scheduler';state.activeTab='scheduler';save()}
function programLevelBucket(p){let grades=p.grades||[];if(grades.includes('Kindergarten')||p.type==='kindergarten')return'kinder';let nums=grades.map(g=>Number((String(g).match(/Grade\s*(\d+)/i)||[])[1]||0)).filter(Boolean);if(nums.some(n=>n>=7&&n<=10))return'jhs';if(nums.some(n=>n>=3&&n<=6))return'g36';if(nums.some(n=>n>=1&&n<=2))return'g12';return'other'}
function programMatchesSchedulerFilter(p,filter){filter=filter||schedulerFilterDefault();if(filter==='all')return true;if(filter==='load')return p.countsTowardLoad!==false;if(filter==='display')return p.countsTowardLoad===false;if(['kinder','g12','g36','jhs'].includes(filter))return programLevelBucket(p)===filter;return true}
function schedulerFilteredPrograms(){let q=String(state.schedulerProgramSearch||'').trim().toLowerCase(),filter=schedulerFilterDefault();return sortedPrograms().filter(p=>programMatchesSchedulerFilter(p,filter)).filter(p=>!q||String(p.name||'').toLowerCase().includes(q)||programGradesLabel(p.grades||[]).toLowerCase().includes(q)||programTypeLabel(p.type).toLowerCase().includes(q))}
function schedulerGroupCounts(){let programs=sortedPrograms();return{all:programs.length,load:programs.filter(p=>p.countsTowardLoad!==false).length,display:programs.filter(p=>p.countsTowardLoad===false).length,kinder:programs.filter(p=>programLevelBucket(p)==='kinder').length,g12:programs.filter(p=>programLevelBucket(p)==='g12').length,g36:programs.filter(p=>programLevelBucket(p)==='g36').length,jhs:programs.filter(p=>programLevelBucket(p)==='jhs').length}}
function railGroupButton(key,label,icon,count){let active=schedulerFilterDefault()===key;return `<button class="railGroup ${active?'active':''}" onclick="setSchedulerFilter('${key}')"><span>${icon}</span><span>${esc(label)}</span><span class="railCount">${count}</span></button>`}
function toggleSchedulerRail(){state.schedulerRailCollapsed=!state.schedulerRailCollapsed;save()}
function expandAndFocusSearch(){if(typeof search!=='undefined'&&search){search.focus();search.select()}}
function setProgramViewMode(mode){state.schedulerProgramsView=mode||'grid';save()}
function toggleSchedulerFilterSelect(v){setSchedulerFilter(v)}
function renderSchedulerRail(){
  let rail=document.getElementById('schedulerRail');
  if(!rail)return;
  if(activeView!=='scheduler'){
    rail.innerHTML='';
    rail.classList.remove('visible','collapsed');
    return;
  }
  let c=schedulerGroupCounts(),recent=sortedPrograms().slice(0,5),collapsed=!!state.schedulerRailCollapsed;
  rail.classList.add('visible');
  rail.classList.toggle('collapsed',collapsed);
  if(collapsed){
    let activeFilter=schedulerFilterDefault();
    rail.innerHTML=`
      <div class="railTop">
        <button class="railCollapseBtn" onclick="toggleSchedulerRail()" title="Expand class scheduler sidebar">${ico('chevron-right','currentColor')}</button>
      </div>
      <div class="railBody">
        <button class="rail-collapsed-icon-btn" onclick="expandAndFocusSearch()" title="Search Class Programs">${ico('search','currentColor')}</button>
        <div class="rail-collapsed-divider"></div>
        <button class="rail-collapsed-icon-btn ${activeFilter==='all'?'active':''}" onclick="setSchedulerFilter('all')" title="All Programs (${c.all})">${ico('book','currentColor')}</button>
        <button class="rail-collapsed-icon-btn ${activeFilter==='load'?'active':''}" onclick="setSchedulerFilter('load')" title="Load Counted (${c.load})">${ico('users','currentColor')}</button>
        <button class="rail-collapsed-icon-btn ${activeFilter==='display'?'active':''}" onclick="setSchedulerFilter('display')" title="Display Only (${c.display})">${ico('calendar','currentColor')}</button>
        <div class="rail-collapsed-divider"></div>
        <button class="rail-collapsed-icon-btn ${activeFilter==='kinder'?'active':''}" onclick="setSchedulerFilter('kinder')" title="Kindergarten (${c.kinder})"><span class="railLevelBadge">K</span></button>
        <button class="rail-collapsed-icon-btn ${activeFilter==='g12'?'active':''}" onclick="setSchedulerFilter('g12')" title="Grades 1-2 (${c.g12})"><span class="railLevelBadge">12</span></button>
        <button class="rail-collapsed-icon-btn ${activeFilter==='g36'?'active':''}" onclick="setSchedulerFilter('g36')" title="Grades 3-6 (${c.g36})"><span class="railLevelBadge">36</span></button>
        <button class="rail-collapsed-icon-btn ${activeFilter==='jhs'?'active':''}" onclick="setSchedulerFilter('jhs')" title="Junior High (${c.jhs})"><span class="railLevelBadge">JH</span></button>
        <div class="rail-collapsed-divider"></div>
        ${recent.length?recent.map(p=>{
          let nameInitials=initials(p.name);
          let color=palette[Array.from(p.id).reduce((acc,char)=>acc+char.charCodeAt(0),0)%palette.length];
          return `<button class="rail-collapsed-recent" onclick="openProgram('${p.id}')" style="background:${color}" title="${esc(p.name)}">${esc(nameInitials)}</button>`;
        }).join(''):''}
      </div>`;
  } else {
    rail.innerHTML=`
      <div class="railTop">
        <div>
          <div class="railTitle">Class Scheduler</div>
          <div class="railSub">Browse class programs without crowding the main sidebar.</div>
        </div>
        <button class="railCollapseBtn" onclick="toggleSchedulerRail()" title="Collapse class scheduler sidebar">${ico('chevron-left','currentColor')}</button>
      </div>
      <div class="railBody">
        <div class="railSectionLabel">Program Groups</div>
        <div class="railGroupList">
          ${railGroupButton('all','All Programs',ico('book','currentColor'),c.all)}
          ${railGroupButton('load','Load Counted',ico('users','currentColor'),c.load)}
          ${railGroupButton('display','Display Only',ico('calendar','currentColor'),c.display)}
        </div>
        <div class="railSectionLabel">By Level</div>
        <div class="railGroupList">
          ${railGroupButton('kinder','Kindergarten',`<span class="railLevelBadge">K</span>`,c.kinder)}
          ${railGroupButton('g12','Grades 1–2',`<span class="railLevelBadge">12</span>`,c.g12)}
          ${railGroupButton('g36','Grades 3–6',`<span class="railLevelBadge">36</span>`,c.g36)}
          ${railGroupButton('jhs','Junior High',`<span class="railLevelBadge">JH</span>`,c.jhs)}
        </div>
        <div class="railSectionLabel">Recent</div>
        <div class="railRecentList">
          ${recent.length?recent.map(p=>`
            <button class="railRecent" onclick="openProgram('${p.id}')">
              ${programEyeToggle(p)}
              <span>${esc(p.name)}</span>
            </button>
          `).join(''):`<div class="muted">No programs yet.</div>`}
        </div>
      </div>`;
  }
}
function renderNav(){let activeScheduler=activeView==='scheduler';nav.innerHTML=`<button class="nav ${activeView==='dashboard'?'active':''}" onclick="openDashboard()">${ico('chart','currentColor')}<span>Dashboard</span></button><button class="nav ${activeScheduler?'active':''}" onclick="openSchedulerHome()">${ico('calendar','currentColor')}<span>Class Scheduler</span></button><button class="nav ${activeView==='summary'?'active':''}" onclick="openSummaryView()">${ico('chart','currentColor')}<span>Summary</span></button><button class="nav ${activeView==='analytics'?'active':''}" onclick="goAnalytics()">${ico('clock','currentColor')}<span>Time Check</span></button>`}
function activeProgram(){return state.programs.find(p=>p.id===state.activeProgramId)||null}
function scopedClasses(){let p=activeView==='scheduler'?activeProgram():null;return activeView==='scheduler'?(p?state.classes.filter(c=>classBelongsToProgram(c,p)):[]):state.classes}
function adviserGradeLabel(grade){let secs=state.sections.filter(s=>s.grade===grade);if(!secs.length)return grade;return secs.map(s=>`${grade} - ${s.name}`).join(', ')}
function gradeLevelTag(grade){let g=String(grade||'').toLowerCase();if(g.includes('kindergarten'))return 'K';let m=g.match(/grade\s*(\d+)/i),n=m?Number(m[1]):0;if(n>=1&&n<=6)return 'ES';if(n>=7&&n<=10)return 'JHS';if(n>=11&&n<=12)return 'SHS';return ''}
function subjectAllowedForGrade(subject,grade){let tags=Array.isArray(subject.tags)?subject.tags:[];if(!tags.length)return true;let tag=gradeLevelTag(grade);if(tag==='K')tag='Kinder';return tags.includes(tag)}
function subjectAllowedForProgram(subject,p,grade=''){if(!p)return subjectAllowedForGrade(subject,grade||activeGrade);let grades=grade?[grade]:(p.grades||[]);return !(Array.isArray(subject.tags)&&subject.tags.length)||grades.some(g=>subjectAllowedForGrade(subject,g))}
function subjectOptionsForContext(grade='',selectedId=''){let p=activeProgram(),list=state.subjects.filter(s=>subjectAllowedForProgram(s,p,grade));if(selectedId&&!list.some(s=>s.id===selectedId)){let s=state.subjects.find(x=>x.id===selectedId);if(s)list.unshift(s)}return list}
function refreshSubjectOptions(grade='',selectedId='',magicRecs=[]){
  let list=subjectOptionsForContext(grade,selectedId);
  let html='';
  if(magicRecs&&magicRecs.length){
    let mIds=magicRecs.map(s=>s.id),mList=list.filter(s=>mIds.includes(s.id)),otherList=list.filter(s=>!mIds.includes(s.id));
    if(mList.length)html+=`<optgroup label="✨ Recommended (Needs Minutes)">`+mList.map(s=>`<option value="${s.id}">✨ ${esc(s.name)}</option>`).join('')+`</optgroup>`;
    if(otherList.length)html+=`<optgroup label="Other Subjects">`+otherList.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')+`</optgroup>`;
  }else{
    html=list.length?list.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join(''):'<option value="">No matching subject tags</option>';
  }
  mSub.innerHTML=html||'<option value="">No matching subject tags</option>';
  if(selectedId&&list.some(s=>s.id===selectedId))mSub.value=selectedId;
  else if(magicRecs&&magicRecs.length&&list.some(s=>s.id===magicRecs[0].id))mSub.value=magicRecs[0].id;
}

function getMagicSubjectRecommendations(grade, programId) {
  let rows = timeAllotmentRowsByGrade(grade);
  let needed = rows.filter(r => r.pct < 100);
  if (!needed.length) return [];
  needed.sort((a,b) => (b.required - b.scheduled) - (a.required - a.scheduled));
  let recs = [];
  needed.forEach(n => {
    let valid = state.subjects.filter(s => matchedLearningAreasForGrade(s.name, grade).includes(n.area));
    valid.forEach(v => { if(!recs.some(rs => rs.id === v.id)) recs.push(v); });
  });
  return recs;
}

function getMagicTeacherRecommendations(subjectId, timeSlotId, day) {
  let subject = state.subjects.find(s => s.id === subjectId);
  if(!subject) return {rec:[], other:[], conflict:[]};
  let sname = subject.name.toLowerCase();
  let teacherLoads = loads();
  let available = [], conflict = [];
  teacherLoads.forEach(tl => {
    let hasConflict = tl.items.some(c => c.timeSlotId === timeSlotId && (c.day||'master') === (day||'master'));
    if(hasConflict) conflict.push(tl.teacher);
    else {
      let t = tl.teacher, history = (t.subjectsTaught || []).map(x=>x.toLowerCase()), specs = (t.specializations || []).map(x=>x.toLowerCase());
      tl._hasExp = history.includes(sname) || specs.some(x => sname.includes(x) || x.includes(sname));
      tl._magicScore = (tl._hasExp ? 10000 : 0) + (5000 - tl.minutes);
      available.push(tl);
    }
  });
  available.sort((a,b) => b._magicScore - a._magicScore);
  return {rec: available.filter(tl => tl._hasExp), other: available.filter(tl => !tl._hasExp), conflict};
}

function populateTeacherOptions(subjectId, timeSlotId, day, selectedId='') {
  let html = '';
  if(subjectId && timeSlotId && !editId) {
    let {rec, other, conflict} = getMagicTeacherRecommendations(subjectId, timeSlotId, day);
    if(rec.length) html += `<optgroup label="✨ Recommended (Experience & Free)">` + rec.map(tl=>`<option value="${tl.teacher.id}">✨ ${esc(tl.teacher.name)} (${(tl.minutes/60).toFixed(1)}h load)</option>`).join('') + `</optgroup>`;
    if(other.length) html += `<optgroup label="Available (Free)">` + other.map(tl=>`<option value="${tl.teacher.id}">${esc(tl.teacher.name)} (${(tl.minutes/60).toFixed(1)}h load)</option>`).join('') + `</optgroup>`;
    if(conflict.length) html += `<optgroup label="Conflicts (Already Scheduled)">` + conflict.map(t=>`<option value="${t.id}" disabled>${esc(t.name)}</option>`).join('') + `</optgroup>`;
    mTeach.innerHTML = html || '<option value="">No available teachers</option>';
    if(selectedId) mTeach.value = selectedId;
    else if(rec.length) mTeach.value = rec[0].teacher.id;
    else if(other.length) mTeach.value = other[0].teacher.id;
  } else {
    mTeach.innerHTML=state.teachers.length?state.teachers.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join(''):'<option value="">Add teachers first</option>';
    if(selectedId) mTeach.value = selectedId;
  }
}
function isMultigradeProgram(p){return !!p&&p.type==='multigrade'}
function adviserNameFromEntry(a){if(!a)return'';if(a.teacherId)return get(state.teachers,a.teacherId).name;return a.name||''}
function adviserForColumn(p,grade,sectionId=''){if(isMultigradeProgram(p)){let a=(p.advisers||[])[0];return adviserNameFromEntry(a)||''}if(sectionId&&state.sectionAdvisers&&state.sectionAdvisers[sectionId])return get(state.teachers,state.sectionAdvisers[sectionId]).name;if(state.advisers&&state.advisers[grade])return get(state.teachers,state.advisers[grade]).name;let a=(p?.advisers||[]).find(x=>x.grade===grade||(!x.grade&&!x.sectionId));return adviserNameFromEntry(a)||''}
function programAdviserDetails(p){if(!p)return[];if(isMultigradeProgram(p)){let name=adviserForColumn(p,(p.grades||[])[0]||'');return name?[`Multigrade Adviser: ${name}`]:[]}let cols=columnsForProgram(p);let seen=new Set(),lines=[];cols.forEach(c=>{let name=adviserForColumn(p,c.grade,c.sectionId);if(name){let label=c.sectionId?`${c.label}: ${name}`:`${c.grade}: ${name}`;if(!seen.has(label)){seen.add(label);lines.push(label)}}});return lines}

function gradeSortValue(label){let text=String(label||'').toLowerCase();if(text.includes('kindergarten'))return 0;let m=text.match(/grade\s*(\d+)/i);return m?Number(m[1]):99}
function sectionSortText(label){let text=String(label||'');let cleaned=text.replace(/kindergarten/i,'').replace(/grade\s*\d+/i,'').replace(/^\s*[-–:]\s*/,'').trim();return cleaned||'zzz'}
function adviserEntriesForTeacher(teacherId){let entries=[],seen=new Set();Object.entries(state.advisers||{}).forEach(([grade,tId])=>{if(tId===teacherId){let key='grade-'+grade;if(!seen.has(key)){seen.add(key);entries.push({label:adviserGradeLabel(grade),grade,minutes:60,type:'grade'})}}});Object.entries(state.sectionAdvisers||{}).forEach(([sid,tId])=>{if(tId===teacherId){let sec=get(state.sections,sid),key='section-'+sid;if(!seen.has(key)){seen.add(key);entries.push({label:`${sec.grade} - ${sec.name}`,grade:sec.grade,minutes:60,type:'section'})}}});let teacherName=(get(state.teachers,teacherId).name||'').trim().toLowerCase(),programs=(state.programs||[]).filter(pr=>pr.countsTowardLoad!==false);programs.forEach(pr=>(pr.advisers||[]).forEach(a=>{let match=(a.teacherId&&a.teacherId===teacherId)||(!a.teacherId&&(a.name||'').trim().toLowerCase()===teacherName);if(match){let key=(isMultigradeProgram(pr)?'mg-program-':'program-')+pr.id;if(!seen.has(key)){seen.add(key);entries.push({label:pr.name,grade:(pr.grades||[])[0]||'',minutes:60,type:isMultigradeProgram(pr)?'multigrade':'program'})}}}));return entries}
function teacherLevelTagsFromLoad(load){let tags=new Set();(load.items||[]).forEach(c=>{let tag=gradeLevelTag(c.grade);if(tag)tags.add(tag)});(load.adviserEntries||[]).forEach(a=>{let tag=gradeLevelTag(a.grade||a.label);if(tag)tags.add(tag)});return ['K','ES','JHS','SHS'].filter(t=>tags.has(t))}
function countedTeachingMinutesForTeacher(items){let total=0,seen=new Set();items.forEach(c=>{let p=state.programs.find(x=>x.id===c.programId),ts=get(state.timeSlots,c.timeSlotId),m=ts.mins||0;if(p&&isMultigradeProgram(p)){let key=[c.teacherId,c.programId,c.timeSlotId,c.day||'master'].join('|');if(seen.has(key))return;seen.add(key)}total+=m});return total}
function countedTeachingBlocksForTeacher(items){let seen=new Set(),count=0;items.forEach(c=>{let p=state.programs.find(x=>x.id===c.programId);if(p&&isMultigradeProgram(p)){let key=[c.teacherId,c.programId,c.timeSlotId,c.day||'master'].join('|');if(seen.has(key))return;seen.add(key)}count++});return count}
function loads(){let list=workloadSourceClasses();return state.teachers.map(t=>{let assigned=list.filter(c=>c.teacherId===t.id),scheduledMinutes=countedTeachingMinutesForTeacher(assigned),adviserEntries=adviserEntriesForTeacher(t.id),adviserMinutes=adviserEntries.reduce((a,x)=>a+x.minutes,0),base={teacher:t,items:assigned,blocks:countedTeachingBlocksForTeacher(assigned),scheduledMinutes,adviserMinutes,adviserCount:adviserEntries.length,adviserEntries,minutes:scheduledMinutes+adviserMinutes};base.levelTags=teacherLevelTagsFromLoad(base);return base})}
function loadStatus(total,target=360){let diff=total-target;if(diff>0)return{label:'OVERLOADED',detail:`${diff} min over`,kind:'overload'};if(diff<0)return{label:'UNDERLOADED',detail:`${Math.abs(diff)} min short`,kind:'underload'};return{label:'MET LOAD',detail:'6 hours met',kind:'met'}}
function diag(){let list=((activeView==='scheduler'&&activeProgram())?scopedClasses():state.classes).filter(classCountsTowardLoad),conflicts=[];for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){let a=list[i],b=list[j];if(a.teacherId&&a.teacherId===b.teacherId&&a.timeSlotId===b.timeSlotId&&(a.day||'master')===(b.day||'master')){let pa=state.programs.find(p=>p.id===a.programId),pb=state.programs.find(p=>p.id===b.programId);if(pa&&pb&&pa.id===pb.id&&isMultigradeProgram(pa))continue;let ts=get(state.timeSlots,a.timeSlotId),tea=get(state.teachers,a.teacherId),sa=get(state.subjects,a.subjectId),sb=get(state.subjects,b.subjectId);conflicts.push({a,b,teacher:tea.name,time:`${to12(ts.start)}–${to12(ts.end)}`,slot:ts,subjectA:sa.name,subjectB:sb.name,gradeA:a.grade,gradeB:b.grade,sectionA:a.sectionId?get(state.sections,a.sectionId).name:'',sectionB:b.sectionId?get(state.sections,b.sectionId).name:'',day:(a.day||'master')})}}return{conflicts}}
function renderMetrics(){let l=loads(),avg=l.length?l.reduce((a,b)=>a+b.minutes,0)/l.length/60:0,d=diag(),confSub=d.conflicts.length?`${d.conflicts.length} need review`:`Everything's perfect! 🎉`,data=[{cls:'teachers',label:'Teachers',value:state.teachers.length,icon:'users',color:'#0f766e',sub:'Dedicated educators'},{cls:'subjects',label:'Subjects',value:state.subjects.length,icon:'book',color:'#3b82f6',sub:'Across all programs'},{cls:'scheduled',label:'Scheduled Subjects',value:state.classes.length,icon:'calendar',color:'#8b5cf6',sub:'Planned & organized'},{cls:'conflicts',label:'Conflicts',value:d.conflicts.length,icon:'alert',color:'#ef4444',sub:confSub},{cls:'avgload',label:'Avg. Load',value:avg.toFixed(1)+'h',icon:'clock',color:'#f59e0b',sub:'Per teacher'}];metrics.innerHTML=data.map(x=>`<div class="card metric ${x.cls}"><div class="metricIcon">${ico(x.icon,x.color)}</div><div class="metricVal">${x.value}</div><div class="metricLab">${x.label}</div><div class="metricSub">${x.sub}</div></div>`).join('')}
function renderFaculty(){faculty.innerHTML=loads().length?loads().sort((a,b)=>b.minutes-a.minutes).map(x=>{let c=teacherColor(x.teacher),pos=x.teacher.position?esc(x.teacher.position):'No teaching position set',room=x.teacher.room?` • Room: ${esc(x.teacher.room)}`:'',st=loadStatus(x.minutes);let pill=`<button type="button" class="workloadStatusPill status-${st.kind}" onclick="event.stopPropagation();openSummaryForStatus('${st.kind}')" title="Open Teaching Load Summary filtered by ${st.label}">${st.label}</button>`;return`<div class="teacher ${selectedTeacher===x.teacher.id?'active':''}" data-status="${st.kind}" draggable="true" ondragstart="dragTeacher(event,'${x.teacher.id}')" onclick="selectedTeacher='${x.teacher.id}';render()" title="Drag this teacher to an empty schedule cell to add a scheduled subject"><div class="avatar" style="background:${c}">${initials(x.teacher.name)}</div><div style="min-width:0"><div class="teacherTop"><div class="teacherName">${esc(x.teacher.name)}</div><button class="btn teacherEditBtn" onclick="event.stopPropagation();editTeacherProfile('${x.teacher.id}')" title="Edit teacher profile">Edit</button></div><div class="teacherMeta"><span class="dot" style="background:${c}"></span>${pos}${room}</div><div class="teacherStatusRow">${pill}</div></div></div>`}).join(''):'<div class="muted">No teachers yet. Add teachers in Settings.</div>'}
function openSummaryForStatus(kind){summaryStatus=kind||'all';activeView='summary';state.activeTab='summary';save()}
function clearTeacher(){selectedTeacher='';search.value='';render()} function renderDiag(){let d=diag();diagnostics.innerHTML=d.conflicts.length?`<div class="alert badbg"><b>${d.conflicts.length} conflict(s) detected.</b><br>${d.conflicts.slice(0,2).map(conflictJumpButton).join('<br>')}</div>`:`<div class="alert ok">No teacher double-booking detected.</div>`}
function groupForView(){return activeView==='master_kinder'?'kinder':activeView==='master_g12'?'g12':'g36'} function gradesForGroup(g){return g==='kinder'?['Kindergarten']:g==='g12'?['Grade 1','Grade 2']:['Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10']} function slotsForGroup(g){g=normGroup(g);return state.timeSlots.filter(ts=>(normGroup(ts.group)==='all'||normGroup(ts.group)===g)&&!ts.programId).sort((a,b)=>(a.start||'').localeCompare(b.start||''))} function slotsForProgram(p){let g=normGroup(p?.group||'g36'),pid=p?.id||'';return state.timeSlots.filter(ts=>(normGroup(ts.group)==='all'||normGroup(ts.group)===g)&&(!ts.programId||ts.programId===pid)).sort((a,b)=>(a.start||'').localeCompare(b.start||''))} function renderContent(){if(activeView==='dashboard')return renderDashboard();if(activeView==='summary')return renderSummary();if(activeView==='analytics')return renderAnalytics();if(activeView==='scheduler')return renderScheduler();renderMatrix(groupForView())}
function safePct(n,d){return d>0?Math.round((n/d)*100):0}
function analyticsStars(score){let filled=score>=90?5:score>=75?4:score>=50?3:score>=25?2:score>0?1:0;return '★'.repeat(filled)+'☆'.repeat(5-filled)}
function analyticsStatusText(score){if(score>=90)return'Ready for Opening of Classes';if(score>=75)return'Nearly Ready';if(score>=50)return'Needs Review';if(score>0)return'Major Setup Needed';return'No Scheduling Data Yet'}
function analyticsCheckLine(kind,label){let mark=kind==='good'?'✓':kind==='warn'?'!':kind==='bad'?'×':'○';return `<div class="analyticsCheck ${kind}"><span class="analyticsCheckIcon">${mark}</span><span>${esc(label)}</span></div>`}
function analyticsProgramStats(){let programs=sortedPrograms(),conflicts=diag().conflicts,programRows=programs.map(p=>{let slots=slotsForProgram(p).filter(ts=>(ts.type||'academic')!=='universal'),cols=columnsForProgram(p),expected=slots.length*cols.length,classes=state.classes.filter(c=>classBelongsToProgram(c,p)),scheduled=classes.length,withTeacher=classes.filter(c=>c.teacherId).length,withSubject=classes.filter(c=>c.subjectId).length,adviserNeeded=cols.length,adviserDone=cols.filter(c=>adviserForColumn(p,c.grade,c.sectionId)).length,programConflicts=conflicts.filter(x=>classBelongsToProgram(x.a,p)||classBelongsToProgram(x.b,p)).length,scheduledPct=safePct(scheduled,expected),teacherPct=safePct(withTeacher,Math.max(scheduled,1)),subjectPct=safePct(withSubject,Math.max(scheduled,1)),adviserPct=safePct(adviserDone,adviserNeeded),conflictPct=programConflicts?0:100,completion=Math.round((scheduledPct*.35)+(teacherPct*.20)+(subjectPct*.15)+(adviserPct*.15)+(conflictPct*.15));return{p,expected,scheduled,withTeacher,withSubject,adviserNeeded,adviserDone,programConflicts,completion}});return{programs,programRows,conflicts}}
function analyticsData(){let a=analyticsProgramStats(),programRows=a.programRows,programs=a.programs,classes=state.classes,loadsList=loads(),totalExpected=programRows.reduce((s,r)=>s+r.expected,0),totalScheduled=programRows.reduce((s,r)=>s+r.scheduled,0),completePrograms=programRows.filter(r=>r.expected>0&&r.scheduled>=r.expected&&r.withTeacher>=r.scheduled&&r.programConflicts===0).length,classesWithSubject=classes.filter(c=>c.subjectId).length,classesWithTeacher=classes.filter(c=>c.teacherId).length,missingSubject=classes.filter(c=>!c.subjectId).length,missingTeacher=classes.filter(c=>!c.teacherId).length,loadMet=loadsList.filter(l=>loadStatus(l.minutes).kind==='met').length,loadOver=loadsList.filter(l=>loadStatus(l.minutes).kind==='overload').length,averageMinutes=loadsList.length?Math.round(loadsList.reduce((s,l)=>s+l.minutes,0)/loadsList.length):0,highest=loadsList.length?Math.max(...loadsList.map(l=>l.minutes)):0,lowest=loadsList.length?Math.min(...loadsList.map(l=>l.minutes)):0,adviserNeeded=programRows.reduce((s,r)=>s+r.adviserNeeded,0),adviserDone=programRows.reduce((s,r)=>s+r.adviserDone,0),programPct=safePct(completePrograms,programs.length),schedulePct=safePct(totalScheduled,totalExpected),subjectPct=safePct(classesWithSubject,Math.max(classes.length,1)),teacherAssignPct=safePct(classesWithTeacher,Math.max(classes.length,1)),teacherLoadPct=loadsList.length?safePct(loadMet,loadsList.length):0,conflictPct=a.conflicts.length?Math.max(0,100-(a.conflicts.length*20)):100,adviserPct=safePct(adviserDone,adviserNeeded);if(!programs.length&&!classes.length)conflictPct=0;let score=Math.round((programPct*.18)+(schedulePct*.20)+(subjectPct*.15)+(teacherAssignPct*.15)+(teacherLoadPct*.12)+(conflictPct*.12)+(adviserPct*.08));return{...a,classes,loadsList,loadOver,averageMinutes,highest,lowest,missingSubject,missingTeacher,programPct,schedulePct,subjectPct,teacherAssignPct,teacherLoadPct,conflictPct,adviserPct,score}}
function baseMatcher(keys){return s=>keys.some(k=>s.includes(k))}
function depedSubjectProfileForGrade(grade){let g=String(grade||'').trim();let commonHgp={area:'HGP',required:45,freq:1,match:baseMatcher(['HGP','HOMEROOM'])};if(g==='Kindergarten')return[{area:'Meeting Time',required:75,freq:5,match:baseMatcher(['MEETING TIME'])},{area:'Circle Time / Language-Literacy',required:425,freq:5,match:baseMatcher(['CIRCLE TIME','LANGUAGE','LITERACY','READING'])},{area:'Mathematics / Numeracy',required:200,freq:5,match:baseMatcher(['MATH','NUMERACY'])},{area:'Thematic Integrated Activities',required:375,freq:5,match:baseMatcher(['THEMATIC','ENGAGING','INTEGRATED','SCIENCE','ARTS','MUSIC','MOVEMENT'])},{area:'Indoor / Outdoor Play',required:175,freq:5,match:baseMatcher(['INDOOR','OUTDOOR','PLAY'])},{area:'Quiet / Nap Time',required:50,freq:5,match:baseMatcher(['QUIET','NAP'])},{area:'Wrap-Up Time',required:100,freq:5,match:baseMatcher(['WRAP','DISMISSAL'])}];if(g==='Grade 1')return[{area:'Language',required:200,freq:5,match:baseMatcher(['LANGUAGE'])},{area:'Reading and Literacy',required:200,freq:5,match:baseMatcher(['READING','LITERACY'])},{area:'Mathematics',required:200,freq:5,match:baseMatcher(['MATH','MATHEMATICS','NUMERACY'])},{area:'GMRC',required:200,freq:5,match:baseMatcher(['GMRC','GOOD MANNERS'])},{area:'Makabansa',required:200,freq:5,match:baseMatcher(['MAKABANSA'])},commonHgp];if(g==='Grade 2')return[{area:'Filipino',required:200,freq:5,match:baseMatcher(['FILIPINO'])},{area:'English',required:200,freq:5,match:baseMatcher(['ENGLISH'])},{area:'Mathematics',required:200,freq:5,match:baseMatcher(['MATH','MATHEMATICS','NUMERACY'])},{area:'GMRC',required:200,freq:5,match:baseMatcher(['GMRC','GOOD MANNERS'])},{area:'Makabansa',required:200,freq:5,match:baseMatcher(['MAKABANSA'])},commonHgp];if(g==='Grade 3')return[{area:'Filipino',required:200,freq:4,match:baseMatcher(['FILIPINO'])},{area:'English',required:225,freq:5,match:baseMatcher(['ENGLISH'])},{area:'Mathematics',required:225,freq:5,match:baseMatcher(['MATH','MATHEMATICS','NUMERACY'])},{area:'Science',required:225,freq:5,match:baseMatcher(['SCIENCE'])},{area:'GMRC',required:225,freq:5,match:baseMatcher(['GMRC','GOOD MANNERS'])},{area:'Makabansa',required:200,freq:4,match:baseMatcher(['MAKABANSA'])},commonHgp];let jhs=['Grade 7','Grade 8','Grade 9','Grade 10'].includes(g);return[{area:'English',required:225,freq:5,match:baseMatcher(['ENGLISH'])},{area:'Mathematics',required:225,freq:5,match:baseMatcher(['MATH','MATHEMATICS','NUMERACY'])},{area:'Science',required:225,freq:5,match:baseMatcher(['SCIENCE'])},{area:'Filipino',required:200,freq:4,match:baseMatcher(['FILIPINO'])},{area:'Araling Panlipunan',required:200,freq:4,match:s=>s==='AP'||s.includes('ARALING PANLIPUNAN')},{area:jhs?'Values Education':'GMRC / Values Education',required:225,freq:5,match:baseMatcher(['VALUES EDUCATION','VALUE EDUCATION','ESP','GMRC','GOOD MANNERS'])},{area:jhs?'TLE':'EPP / TLE',required:200,freq:4,match:baseMatcher(['TLE','EPP','TECHNOLOGY','LIVELIHOOD'])},{area:'MAPEH',required:200,freq:4,match:baseMatcher(['MAPEH','MUSIC','ARTS','PHYSICAL EDUCATION','PE AND HEALTH','HEALTH'])},commonHgp]}
function learningAreaCatalog(){return depedSubjectProfileForGrade('Grade 4')}
function matchedLearningAreasForGrade(subjectName,grade){let s=String(subjectName||'').toUpperCase().replace(/\s+/g,' ').trim(),profile=depedSubjectProfileForGrade(grade),matches=profile.filter(c=>c.match(s)).map(c=>c.area);return [...new Set(matches)]}
function matchedLearningAreas(subjectName){return matchedLearningAreasForGrade(subjectName,'Grade 4')}
function isAralSubject(subjectName){let s=String(subjectName||'').toUpperCase();return s.includes('ARAL PROGRAM')||s.includes('ARAL READING')||s.includes('ARAL MATHEMATICS')||s.includes('ARAL SCIENCE')}
function curriculumSourceClasses(){return workloadSourceClasses().filter(c=>c.subjectId&&c.timeSlotId)}
function curriculumIsWeeklyEncoded(source){return source.some(c=>c.day&&c.day!=='master')}
function curriculumFrequencyForArea(area,isWeeklyEncoded,grade){if(isWeeklyEncoded)return 1;let cat=depedSubjectProfileForGrade(grade).find(c=>c.area===area);return cat?cat.freq:1}
function curriculumClassKey(c){return `${c.programId||'no-program'}|${c.grade||''}|${c.sectionId||''}`}
function curriculumModeLabel(){let source=curriculumSourceClasses(),weekly=curriculumIsWeeklyEncoded(source);return weekly?'Actual weekly schedule detected — minutes are summed as encoded.':'One-day class program template detected — daily minutes are projected to weekly targets.'}
function learningAreaStats(data){let grades=gradeLevelsForTimeChecker(),all=[];grades.forEach(g=>all.push(...timeAllotmentRowsByGrade(g)));let areas=[...new Set(all.map(r=>r.area))];return areas.map(area=>{let rows=all.filter(r=>r.area===area),required=rows.length?Math.round(rows.reduce((s,r)=>s+r.required,0)/rows.length):0,scheduled=rows.length?Math.round(rows.reduce((s,r)=>s+r.scheduled,0)/rows.length):0,pct=safePct(Math.min(scheduled,required),required),status=scheduled<=0?'missing':pct>=100?'met':pct>=80?'flexible':'review',label=status==='met'?'Met':status==='flexible'?'Flexible Arrangement':status==='review'?'Needs Review':'Missing';return{area,required,scheduled,pct,status,label}})}
function curriculumPctFromRows(rows){return rows.length?Math.round(rows.reduce((s,r)=>s+r.pct,0)/rows.length):0}
function curriculumScopeLabel(){let counted=state.programs.filter(p=>p.countsTowardLoad!==false).length,display=state.programs.filter(p=>p.countsTowardLoad===false).length;return `${counted} load-counted/master program(s) checked${display?`; ${display} display-only program(s) excluded`:''}`}
function statusForCompliance(pct,scheduled){if(!scheduled)return{kind:'bad',label:'Missing'};if(pct>=100)return{kind:'good',label:'Compliant'};if(pct>=80)return{kind:'warn',label:'Flexible / Review'};return{kind:'bad',label:'Needs Review'}}
function gradeLevelsForTimeChecker(){let source=curriculumSourceClasses(),grades=[...new Set(source.map(c=>c.grade).filter(Boolean))];if(!grades.length)grades=(state.grades||[]);return grades.sort(programGradeSort)}
function timeAllotmentRowsByGrade(grade){let cats=depedSubjectProfileForGrade(grade),source=curriculumSourceClasses().filter(c=>c.grade===grade),isWeekly=curriculumIsWeeklyEncoded(source),classKeys=[...new Set(source.map(curriculumClassKey))];return cats.map(cat=>{let byKey={};source.forEach(c=>{let subj=get(state.subjects,c.subjectId).name;if(isAralSubject(subj))return;let ts=get(state.timeSlots,c.timeSlotId),mins=Number(ts.mins)||0,areas=matchedLearningAreasForGrade(subj,grade);if(!areas.includes(cat.area))return;let freq=curriculumFrequencyForArea(cat.area,isWeekly,grade),weekly=isWeekly?mins:mins*freq,key=curriculumClassKey(c);byKey[key]=(byKey[key]||0)+weekly});let vals=classKeys.map(k=>byKey[k]||0),scheduled=classKeys.length?Math.round(vals.reduce((a,b)=>a+b,0)/classKeys.length):0,pct=safePct(Math.min(scheduled,cat.required),cat.required),st=statusForCompliance(pct,scheduled);return{grade,area:cat.area,required:cat.required,scheduled,pct,status:st.label,kind:st.kind}})}
function aralRowsByGrade(grade){let source=curriculumSourceClasses().filter(c=>c.grade===grade&&isAralSubject(get(state.subjects,c.subjectId).name));if(!source.length)return'';let total=source.reduce((s,c)=>s+(Number(get(state.timeSlots,c.timeSlotId).mins)||0),0);return `<div class="levelComplianceBox"><b>ARAL Intervention Block</b><span>${Math.round(total)} raw scheduled minute(s) encoded separately from required learning-area compliance.</span></div>`}
function gradeComplianceSummary(grade){let rows=timeAllotmentRowsByGrade(grade),score=rows.length?Math.round(rows.reduce((s,r)=>s+r.pct,0)/rows.length):0,missing=rows.filter(r=>!r.scheduled).length,kind=score>=90&&!missing?'good':score>=75?'warn':'bad',label=kind==='good'?'Compliant':kind==='warn'?'Needs Review':'Incomplete';return{grade,rows,score,missing,kind,label,aral:aralRowsByGrade(grade)}}
function overallTimeCompliance(){let grades=gradeLevelsForTimeChecker(),summaries=grades.map(gradeComplianceSummary),score=summaries.length?Math.round(summaries.reduce((s,g)=>s+g.score,0)/summaries.length):0,compliant=summaries.filter(g=>g.kind==='good').length,kind=score>=90?'good':score>=75?'warn':'bad',label=kind==='good'?'Time Allotment Compliant':kind==='warn'?'Time Allotment Needs Review':'Time Allotment Incomplete',message=summaries.length?`${compliant} of ${summaries.length} grade level(s) are fully compliant. ${curriculumModeLabel()}`:'No scheduled class program data found yet.';return{grades,summaries,score,compliant,kind,label,message}}
function timeAllotmentTableRows(rows){return rows.map(r=>`<tr><td>${esc(r.area)}</td><td style="text-align:center">${r.required}</td><td style="text-align:center">${r.scheduled}</td><td><span class="statusText ${r.kind}">${esc(r.status)}</span></td></tr>`).join('')}
function programGroupRows(data){let groups=[{name:'Kindergarten Program',badge:'K',cls:'programBadgeK',match:p=>(p.grades||[]).some(g=>String(g).includes('Kindergarten'))},{name:'Grades 1–2 Program',badge:'1-2',cls:'programBadge12',match:p=>(p.grades||[]).some(g=>['Grade 1','Grade 2'].includes(g))},{name:'Grades 3–6 Program',badge:'3-6',cls:'programBadge36',match:p=>(p.grades||[]).some(g=>['Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10'].includes(g))}];return groups.map(g=>{let rows=data.programRows.filter(r=>g.match(r.p)),pct=rows.length?Math.round(rows.reduce((s,r)=>s+r.completion,0)/rows.length):0,adv=rows.length&&rows.every(r=>!r.adviserNeeded||r.adviserDone>=r.adviserNeeded),sub=rows.length&&rows.every(r=>r.withSubject>=r.scheduled&&r.scheduled>0),slot=rows.length&&rows.every(r=>r.expected>0&&r.scheduled>=r.expected),conf=rows.every(r=>!r.programConflicts);return{...g,pct,adv,sub,slot,conf}})}
function programCompletionCard(g){return `<div class="programProgressCard"><div class="programBadgeCircle ${g.cls}">${esc(g.badge)}</div><div><div class="programProgressName">${esc(g.name)}</div><div class="programProgressLine"><div class="programProgressTrack" style="flex:1"><div class="programProgressFill" style="width:${g.pct}%"></div></div><span class="programProgressPct">${g.pct}%</span></div></div><div class="programMiniChecks"><div class="programMiniCheck"><span class="miniCheckIcon ${g.adv?'':'warn'}">${g.adv?'✓':'!'}</span>Adviser Assigned</div><div class="programMiniCheck"><span class="miniCheckIcon ${g.sub?'':'warn'}">${g.sub?'✓':'!'}</span>Subjects Assigned</div><div class="programMiniCheck"><span class="miniCheckIcon ${g.slot?'':'warn'}">${g.slot?'✓':'!'}</span>Time Slots Assigned</div><div class="programMiniCheck"><span class="miniCheckIcon ${g.conf?'':'warn'}">${g.conf?'✓':'!'}</span>No Conflicts</div></div></div>`}
function teacherWorkloadRows(data){let rows=data.loadsList.slice().sort((a,b)=>b.minutes-a.minutes).slice(0,7);if(!rows.length)return `<tr><td colspan="3">No teacher workload data available.</td></tr>`;return rows.map(l=>{let st=loadStatus(l.minutes);return `<tr><td><div class="teacherCellMini"><span class="teacherMiniAvatar" style="background:${teacherColor(l.teacher.color)}">${initials(l.teacher.name)||'--'}</span>${esc(l.teacher.name)}</div></td><td style="text-align:center">${(l.minutes/60).toFixed(1)}</td><td><span class="loadStatusMini status-${st.kind}" title="${esc(st.detail)}"><span class="statusDot ${st.kind}"></span>${esc(st.label)}</span></td></tr>`}).join('')}
function curriculumRows(stats){return stats.map(r=>`<tr><td>${esc(r.area)}</td><td style="text-align:center">${r.required}</td><td style="text-align:center">${r.scheduled}</td><td class="compliancePct" style="text-align:center">${r.pct}%</td><td style="text-align:center"><span class="timeStatusChip ${r.status}">${esc(r.label)}</span></td></tr>`).join('')}
function policyAlignmentRows(data,curriculumPct){let rows=[{indicator:'Class Programs / Teachers’ Programs Prepared',basis:'Program completion and teacher assignment readiness',pct:Math.round((data.programPct+data.teacherAssignPct)/2),kind:'tracked'},{indicator:'MATATAG Time Allotments Checked',basis:'Scheduled minutes compared with target learning-area minutes',pct:curriculumPct,kind:'tracked'},{indicator:'Teacher Workload Rationalization',basis:'Teaching load status from Summary workload calculation',pct:data.teacherLoadPct,kind:'tracked'},{indicator:'Teacher Availability Considered',basis:'Scheduled classes with assigned teachers',pct:data.teacherAssignPct,kind:'tracked'},{indicator:'Schedule Conflict-Free',basis:'Teacher double-booking and schedule conflict detection',pct:data.conflictPct,kind:'tracked'},{indicator:'Classroom Availability Considered',basis:'Confirm classrooms, shifts, and room sharing outside the scheduler',pct:null,kind:'manual'},{indicator:'Three-Term Calendar Alignment',basis:'Confirm school activities follow Opening, Instructional, and End-of-Term blocks',pct:null,kind:'manual'},{indicator:'Localized Constraints Reviewed',basis:'Confirm enrolment, class density, staffing, and local operational constraints',pct:null,kind:'manual'}];return rows.map(r=>{let status=r.kind==='manual'?'manual':r.pct>=90?'met':r.pct>=60?'review':'missing',mark=status==='met'?'✓':status==='manual'?'•':'!',statusLabel=status==='met'?'Met':status==='review'?'Needs Review':status==='manual'?'Manual Validation Required':'Missing';return{...r,status,mark,statusLabel}})}
function policyTrackedScore(rows){let tracked=rows.filter(r=>r.kind==='tracked');return tracked.length?Math.round(tracked.reduce((s,r)=>s+(r.pct||0),0)/tracked.length):0}
function policyRowsHtml(rows){return rows.map(r=>`<div class="policyCheck"><span class="policyCheckIcon ${r.status}">${r.mark}</span><span class="policyIndicatorText"><span class="policyIndicatorName">${esc(r.indicator)}</span><span class="policyIndicatorBasis">${esc(r.basis)}</span></span><span class="policyStatusChip ${r.status}">${r.kind==='manual'?r.statusLabel:r.statusLabel+' • '+r.pct+'%'}</span></div>`).join('')}
function readinessLevel(score){if(score>=90)return{kind:'good',label:'READY',caption:'Ready for Opening of Classes'};if(score>=75)return{kind:'warn',label:'NEARLY READY',caption:'For Final Review Before Opening'};if(score>=50)return{kind:'bad',label:'NEEDS COMPLETION',caption:'Needs Completion Before Opening'};return{kind:'empty',label:'MAJOR SETUP',caption:'Major Setup Required'}}
function readinessIcon(kind){return kind==='good'?'✓':kind==='warn'?'!':kind==='bad'?'×':'○'}
function readinessStatusLabel(kind){return kind==='good'?'Complete':kind==='warn'?'Review':kind==='bad'?'Blocking':'No Data'}
function readinessItemRows(data){let hasPrograms=data.programs.length>0,hasClasses=data.classes.length>0;return[{label:'Class Programs Completed',kind:!hasPrograms?'empty':data.programPct>=90?'good':data.programPct>0?'warn':'bad'},{label:'Teacher Programs Generated',kind:!hasClasses?'empty':data.teacherAssignPct>=90?'good':data.teacherAssignPct>0?'warn':'bad'},{label:'Subject Assignments Complete',kind:!hasClasses?'empty':data.subjectPct>=90?'good':data.subjectPct>0?'warn':'bad'},{label:'Time Slots Assigned',kind:!hasPrograms?'empty':data.schedulePct>=90?'good':data.schedulePct>0?'warn':'bad'},{label:'Advisers Assigned',kind:!hasPrograms?'empty':data.adviserPct>=90?'good':data.adviserPct>0?'warn':'bad'},{label:'No Scheduling Conflicts',kind:!hasPrograms?'empty':data.conflicts.length?'bad':'good'}]}
function readinessRowsHtml(rows){return rows.map(r=>`<div class="readyCheckLine"><span class="readyStatusIcon ${r.kind}">${readinessIcon(r.kind)}</span><span>${esc(r.label)}</span><span class="readyStatusChip ${r.kind}">${readinessStatusLabel(r.kind)}</span></div>`).join('')}
function firstAnalyticsIssueText(data){if(data.conflicts.length){let c=data.conflicts[0];return `${c.gradeA} ${c.subjectA} — teacher conflict at ${c.time}.`}if(data.missingTeacher)return`${data.missingTeacher} scheduled subject(s) have no assigned teacher.`;if(data.missingSubject)return`${data.missingSubject} scheduled class(es) have no subject selected.`;let incomplete=data.programRows.find(r=>r.expected&&r.scheduled<r.expected);if(incomplete)return`${incomplete.p.name} has ${incomplete.expected-incomplete.scheduled} missing schedule slot(s).`;return'No active issue found.'}
function analyticsInfoDate(){let d=new Date();return d.toLocaleString([], {year:'numeric',month:'long',day:'2-digit',hour:'2-digit',minute:'2-digit'})}
function renderAnalytics(){let overall=overallTimeCompliance();viewTitle.textContent='Analytics';viewSub.textContent='Grade-level weekly time-allotment checker.';viewControls.innerHTML='';let gradeCards=overall.summaries.map(g=>`<section class="gradeCheckerCard"><div class="gradeCheckerHead"><div class="gradeCheckerTitle">${esc(g.grade)} Time Allotment</div><span class="gradeCompliancePill ${g.kind}">${g.score}% • ${esc(g.label)}</span></div><table class="timeAllotmentTable"><thead><tr><th>Learning Area</th><th>Required (mins/wk)</th><th>Scheduled (mins/week)</th><th>Compliance Status</th></tr></thead><tbody>${timeAllotmentTableRows(g.rows)}</tbody></table><div class="levelComplianceBox"><b>Level of Compliance</b><span>${g.score}% — ${esc(g.label)}${g.missing?` • ${g.missing} missing area(s)`:''}</span></div>${g.aral||''}</section>`).join('')||`<section class="gradeCheckerCard"><div class="empty">No scheduled class program data available for checking.</div></section>`;content.innerHTML=`<div class="analyticsPage cleanAnalytics"><section class="timeHero ${overall.kind}"><div><h2>${esc(overall.label)}</h2><p>${esc(overall.message)}</p><div style="margin-top:12px; display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.15); padding:6px 12px; border-radius:99px; font-size:12px; font-weight:600; cursor:help;" title="Required subjects are listed per grade level, including JHS profiles. ARAL is shown separately as an intervention block."><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"></circle><path stroke-width="2" d="M12 16v-4M12 8h.01"></path></svg> Basis: ${esc(curriculumScopeLabel())}</div></div><div class="timeHeroScore"><div><b>${overall.score}%</b><br><span>Overall Compliance</span></div></div></section><div class="gradeCheckerGrid">${gradeCards}</div><div class="analyticsTimestamp">ⓘ Time allotment analytics are based on the latest saved load-counted/master class programs as of ${esc(analyticsInfoDate())}.</div></div>`}
function conflictLabel(c){let secA=c.sectionA?` - ${c.sectionA}`:'',secB=c.sectionB?` - ${c.sectionB}`:'';return `${esc(c.teacher)} is assigned twice at ${esc(c.time)}: ${esc(c.subjectA)} (${esc(c.gradeA)}${esc(secA)}) and ${esc(c.subjectB)} (${esc(c.gradeB)}${esc(secB)}).`}
function conflictJumpButton(c){return `<button class="conflictJump" onclick="highlightConflict('${c.a.id}','${c.b.id}')" title="Open and highlight this conflict">${conflictLabel(c)}</button>`}
function highlightConflict(aId,bId){let c=state.classes.find(x=>x.id===aId)||state.classes.find(x=>x.id===bId);if(c&&c.programId){state.activeProgramId=c.programId;state.schedulerExpanded=true;activeView='scheduler';state.activeTab='scheduler';selectedTeacher=c.teacherId||selectedTeacher;localStorage.setItem(STORE,JSON.stringify(state));render()}setTimeout(()=>{[aId,bId].forEach(id=>{let el=document.querySelector(`.block[data-class-id="${id}"]`);if(el){el.classList.add('conflictFocus');el.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});setTimeout(()=>el.classList.remove('conflictFocus'),2600)}})},120)}
function inlineDiagnostics(){let d=diag();if(!d.conflicts.length)return `<div class="alert ok inlineDiag"><div class="diagTitle">No teacher double-booking detected.</div></div>`;let shown=d.conflicts.slice(0,3).map(c=>`<li>${conflictJumpButton(c)}</li>`).join(''),more=d.conflicts.length>3?`<li>${d.conflicts.length-3} more conflict(s). Use Teacher Workload or search by teacher name to review remaining entries.</li>`:'';return `<div class="alert badbg inlineDiag"><div class="diagTitle">${d.conflicts.length} teacher conflict(s) detected.</div><ul class="diagDetails">${shown}${more}</ul><div class="diagHint">Guide: change the teacher, move one scheduled subject to another time slot, or remove the duplicate scheduled subject.</div></div>`}
function programAdviserLine(p){let lines=programAdviserDetails(p);return lines.length?'Adviser(s): '+lines.join('; '):''}
function dashboardProgramClass(p){if(p.type==='kindergarten'||(p.grades||[]).includes('Kindergarten'))return 'kindergarten';if((p.grades||[]).some(g=>['Grade 1','Grade 2'].includes(g)))return 'g12';return 'g36'}
function dashboardProgramArt(cls){return `<div class="progArt ${cls==='kindergarten'?'artStar':cls==='g12'?'artBook':'artTrophy'}"></div>`}
function programAdviserCompact(p){let lines=programAdviserDetails(p),count=lines.length;if(!count)return 'No adviser assigned';return count===1?'1 adviser assigned':`${count} advisers assigned`}
function programGradesDisplay(p){return (p.grades||[]).join(', ')||'No grades selected'}
function programCardHtml(p,mode='dashboard'){let cls=dashboardProgramClass(p),status=programStatusInfo(p),linked=state.classes.filter(c=>classBelongsToProgram(c,p)),teacherCount=new Set(linked.map(c=>c.teacherId).filter(Boolean)).size,advLines=programAdviserDetails(p),advCompact=programAdviserCompact(p),menuId='prog-card-'+p.id;if(mode==='scheduler'){menuRegistry[menuId]=[{label:'Open',action:()=>openProgram(p.id)},{label:'Edit',action:()=>editProgram(p.id)},{label:'Split Classes',action:()=>splitProgramClasses(p.id)},{label:'Combine Classes',action:()=>openCombineProgramModal(p.id)},{label:p.countsTowardLoad===false?'Count in Teaching Load':'Set as Display Only',action:()=>toggleProgramLoad(p.id)},{label:'Delete',danger:true,action:()=>deleteProgram(p.id)}]}let actions=mode==='scheduler'?`<button class="btn primary" onclick="openProgram('${p.id}')">Open</button><button class="btn" onclick="editProgram('${p.id}')">Edit</button><button class="btn programMoreBtn" onclick="event.stopPropagation();toggleContextMenu(event,'${menuId}')">...</button>`:`<button class="btn primary" onclick="openProgram('${p.id}')">Open</button><button class="btn" onclick="editProgram('${p.id}')">Edit</button>`;return `<div class="programCard ${cls}" data-search="${esc((p.name+' '+programTypeLabel(p.type)+' '+programGradesDisplay(p)+' '+advLines.join(' ')).toLowerCase())}"><span class="programStatusPill programStatus-${status.kind}">${status.label}</span><div class="programType">${programTypeLabel(p.type)}</div><div class="programName">${esc(p.name)}</div><div class="programMeta compact"><div class="programMetaLine">Grades: ${esc(programGradesDisplay(p))}</div><div class="programAdviserCompact" title="${esc(advLines.join('\n')||'No adviser assigned')}">Advisers: ${esc(advCompact)}</div></div><div class="programStats"><span class="programMiniStat">${ico('calendar','#344054')} ${linked.length} scheduled</span><span class="programMiniStat">${ico('users','#344054')} ${teacherCount} teacher(s)</span>${programLoadBadge(p)}</div><div class="programTip">${esc(status.tip)}</div>${dashboardProgramArt(cls)}<div class="programActions">${actions}</div></div>`}
function programStatusInfo(p){let linked=state.classes.filter(c=>classBelongsToProgram(c,p)),conf=diag().conflicts.some(x=>classBelongsToProgram(x.a,p)||classBelongsToProgram(x.b,p));if(conf)return{kind:'conflict',label:'Conflict',tip:'Needs schedule review'};if(!linked.length)return{kind:'empty',label:'Empty',tip:'No scheduled subjects yet'};let teacherCount=new Set(linked.map(c=>c.teacherId).filter(Boolean)).size;if(teacherCount&&linked.length>=Math.max(1,(p.grades||[]).length*3))return{kind:'ready',label:'Ready',tip:'Has scheduled subjects and assigned teachers'};return{kind:'progress',label:'In Progress',tip:'Continue assigning subjects and teachers'}}
function setupStatusInfo(d){let hasTeachers=state.teachers.length>0,hasSubjects=state.subjects.length>0,hasPrograms=(state.programs||[]).length>0,hasScheduled=state.classes.length>0,hasAdviser=Object.values(state.advisers||{}).some(Boolean)||Object.values(state.sectionAdvisers||{}).some(Boolean)||(state.programs||[]).some(p=>(p.advisers||[]).some(a=>a.name));if(d.conflicts.length)return{kind:'review-needed',label:'Review Needed',icon:'⚠',title:'Teacher conflict detected.',message:'Review schedule conflicts before printing or finalizing.',action:'Review Scheduler',onclick:'openSchedulerHome()'};if(!hasTeachers)return{kind:'setup-needed',label:'Setup Needed',icon:'!',title:'Next step: Add teachers.',message:'Teachers are required before scheduled subjects can be assigned.',action:'Add Teachers',onclick:"openSettings();settingsTab('teachers')"};if(!hasSubjects)return{kind:'setup-needed',label:'Setup Needed',icon:'!',title:'Next step: Add subjects.',message:'Subjects are required before building class schedules.',action:'Add Subjects',onclick:"openSettings();settingsTab('subjects')"};if(!hasPrograms)return{kind:'setup-needed',label:'Setup Needed',icon:'!',title:'Next step: Create a class program.',message:'Create at least one class program to begin scheduling.',action:'Add Class Program',onclick:'openProgramModal()'};if(!hasScheduled)return{kind:'setup-needed',label:'Setup Needed',icon:'!',title:'Next step: Add scheduled subjects.',message:'Open a class program and start assigning subjects to time blocks.',action:'Open Scheduler',onclick:'openSchedulerHome()'};if(!hasAdviser)return{kind:'setup-needed',label:'Setup Needed',icon:'!',title:'Recommended: Assign advisers.',message:'Adviser assignments improve teaching load reporting and class program completeness.',action:'Assign Advisers',onclick:"openSettings();settingsTab('advisers')"};return{kind:'all-good',label:'All Good!',icon:'✓',title:'No teacher double-booking detected.',message:'Great job! Your schedule is conflict-free and setup looks complete.',action:'View Scheduler',onclick:'openSchedulerHome()'}}
function setupCheckRows(){let adviserCount=Object.values(state.advisers||{}).filter(Boolean).length+Object.values(state.sectionAdvisers||{}).filter(Boolean).length+(state.programs||[]).reduce((a,p)=>a+(p.advisers||[]).filter(x=>x.name).length,0);let rows=[{label:'Teachers',count:state.teachers.length,done:state.teachers.length>0,hint:'Add teacher profiles'}, {label:'Subjects',count:state.subjects.length,done:state.subjects.length>0,hint:'Subject bank available'}, {label:'Class Programs',count:(state.programs||[]).length,done:(state.programs||[]).length>0,hint:'At least one program'}, {label:'Scheduled Subjects',count:state.classes.length,done:state.classes.length>0,hint:'Subjects placed in matrix'}, {label:'Advisers',count:adviserCount,done:adviserCount>0,hint:'Advisory assignments'}];return rows.map(r=>`<div class="setupCheckItem ${r.done?'done':'todo'}"><span class="setupCheckIcon">${r.done?'✓':'!'}</span><div><div class="setupCheckTitle">${r.label}</div><div class="setupCheckHint">${r.hint}</div></div><span class="setupCheckCount">${r.count}</span></div>`).join('')}

function minutesOfDay(t){let [h,m]=String(t||'00:00').split(':').map(Number);return (h||0)*60+(m||0)}
function isNowInSlot(ts){let now=new Date(),cur=now.getHours()*60+now.getMinutes(),start=minutesOfDay(ts.start),end=minutesOfDay(ts.end);if(end<start)return cur>=start||cur<end;return cur>=start&&cur<end}
function ongoingClasses(){return state.classes.map(c=>({c,ts:get(state.timeSlots,c.timeSlotId),sub:get(state.subjects,c.subjectId),tea:get(state.teachers,c.teacherId),prog:state.programs.find(p=>p.id===c.programId)})).filter(x=>x.ts&&x.ts.id&&isNowInSlot(x.ts)).sort((a,b)=>(a.ts.start||'').localeCompare(b.ts.start||''))}
function goAnalytics(){activeView='analytics';state.activeTab='analytics';save()}

function dashboardHeroHtml(){
  let sc=state.schoolConfig;
  let name=sc?.schoolName || 'Class Program Scheduler';
  let sy=currentSchoolYearName();
  return `<section class="db-hero">
    <div class="db-hero-text">
      <div class="db-hero-welcome">${ico('baby', '#fde047')}<span>Welcome to Command Center</span></div>
      <h2>${esc(name.toUpperCase())}</h2>
      <p>School Timetable and Faculty Workload Manager • Active Year: ${esc(formatSchoolYearLabel(sy))}</p>
    </div>
    <div class="db-hero-actions">
      <button class="btn primary" onclick="openProgramModal()">${ico('plus', 'var(--accent)')} Add Program</button>
      <button class="btn secondary" onclick="openSchedulerHome()">${ico('calendar', '#ffffff')} Open Scheduler</button>
    </div>
  </section>`;
}

function dashboardMetricsHtml(){
  let l=loads(), avg=l.length ? l.reduce((a,b)=>a+b.minutes,0)/l.length/60 : 0;
  let d=diag();
  let data=analyticsData();
  let score=data.score;
  let hasIssues = (d.conflicts.length + data.missingTeacher + data.missingSubject) > 0;
  
  let healthLabel = 'Excellent Health';
  let healthClass = 'ready';
  if (score < 50) { healthLabel = 'Critical Issues'; healthClass = 'conflict'; }
  else if (score < 80) { healthLabel = 'Needs Review'; healthClass = 'progress'; }
  else if (score < 100) { healthLabel = 'Good Health'; healthClass = 'ready'; }

  let metrics = [
    { cls: 'teachers', label: 'Teachers', value: state.teachers.length, sub: 'Faculty encodes', icon: 'users', color: '#0f766e', onclick: "openSettings(); settingsTab('teachers')" },
    { cls: 'subjects', label: 'Subjects', value: state.subjects.length, sub: 'Subject bank catalog', icon: 'book', color: '#3b82f6', onclick: "openSettings(); settingsTab('subjects')" },
    { cls: 'scheduled', label: 'Scheduled Classes', value: state.classes.length, sub: 'Blocks encoded', icon: 'calendar', color: '#8b5cf6', onclick: "openSchedulerHome()" },
    { cls: 'health ' + (hasIssues ? 'has-issues' : ''), label: 'Schedule Health', value: score + '%', sub: healthLabel, icon: 'chart', color: hasIssues ? '#ef4444' : '#10b981', onclick: "openSchedulerHome()" }
  ];

  return `<div class="db-metrics-grid">
    ${metrics.map(x => `
      <div class="db-metric-card ${x.cls}" onclick="${x.onclick}">
        <div class="db-metric-icon-wrap">
          ${ico(x.icon, x.color)}
        </div>
        <div class="db-metric-info">
          <div class="db-metric-label">${esc(x.label)}</div>
          <div class="db-metric-value">${x.value}</div>
          <div class="db-metric-sub">${esc(x.sub)}</div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

function dashboardReadinessHtml(){
  let adviserCount=Object.values(state.advisers||{}).filter(Boolean).length+Object.values(state.sectionAdvisers||{}).filter(Boolean).length+(state.programs||[]).reduce((a,p)=>a+(p.advisers||[]).filter(x=>x.name).length,0);
  let checks=[
    { label: 'Teachers', count: state.teachers.length, done: state.teachers.length > 0, hint: 'Assign schedules & workload', onclick: "openSettings(); settingsTab('teachers')" },
    { label: 'Subjects Bank', count: state.subjects.length, done: state.subjects.length > 0, hint: 'Configure subject catalog', onclick: "openSettings(); settingsTab('subjects')" },
    { label: 'Class Programs', count: (state.programs||[]).length, done: (state.programs||[]).length > 0, hint: 'Setup class timetable groups', onclick: "openProgramModal()" },
    { label: 'Scheduled Subjects', count: state.classes.length, done: state.classes.length > 0, hint: 'Place classes in schedule matrix', onclick: "openSchedulerHome()" },
    { label: 'Advisers Assigned', count: adviserCount, done: adviserCount > 0, hint: 'Assign grade advisory positions', onclick: "openSettings(); settingsTab('advisers')" }
  ];
  let doneCount = checks.filter(x => x.done).length;
  let pct = Math.round((doneCount / checks.length) * 100);

  return `<div class="db-card">
    <div class="db-card-header">
      <div class="db-card-title">${ico('refresh', 'var(--accent)')}<span>Setup Readiness Checklist</span></div>
      <span class="db-prog-status-badge ${doneCount === checks.length ? 'ready' : 'progress'}">${doneCount}/${checks.length} Steps (${pct}%)</span>
    </div>
    <div class="db-readiness-checklist">
      ${checks.map(c => `
        <div class="db-check-item ${c.done ? 'done' : 'todo'}" onclick="${c.onclick}">
          <div class="db-check-status-icon">${c.done ? '✓' : '!'}</div>
          <div class="db-check-info">
            <div class="db-check-label">${esc(c.label)}</div>
            <div class="db-check-hint">${esc(c.hint)}</div>
          </div>
          <span class="db-check-count-badge">${c.count}</span>
        </div>
      `).join('')}
    </div>
  </div>`;
}

function dashboardProgramsHtml(){
  let programs=sortedPrograms();
  let list=programs.slice(0, 6);
  let cards=list.map(p => {
    let linked=state.classes.filter(c => classBelongsToProgram(c, p));
    let teacherCount=new Set(linked.map(c => c.teacherId).filter(Boolean)).size;
    let slots=slotsForProgram(p), cols=columnsForProgram(p);
    let totalSlots=slots.filter(s => s.type !== 'universal').length * cols.length;
    let pct=totalSlots ? Math.min(100, Math.round((linked.length / totalSlots) * 100)) : 0;
    
    // Status
    let status='progress';
    let statusLabel='In Progress';
    let coverageColorClass='';
    
    let hasConf=diag().conflicts.some(x=>classBelongsToProgram(x.a,p)||classBelongsToProgram(x.b,p));
    if (hasConf) {
      status='conflict';
      statusLabel='Conflict';
      coverageColorClass='conflict';
    } else if (linked.length === 0) {
      status='empty';
      statusLabel='Empty';
      coverageColorClass='empty';
    } else if (pct >= 90) {
      status='ready';
      statusLabel='Ready';
    }
    
    return `<div class="db-prog-card">
      <div class="db-prog-header">
        <div>
          <div class="db-prog-type">${esc(programTypeLabel(p.type))}</div>
          <div class="db-prog-name" title="${esc(p.name)}">${esc(p.name)}</div>
        </div>
        <span class="db-prog-status-badge ${status}">${statusLabel}</span>
      </div>
      <div class="db-prog-grades" title="${esc(programGradesLabel(p.grades))}">Grades: ${esc(programGradesLabel(p.grades))}</div>
      <div class="db-prog-stats">
        <span class="db-prog-stat-item">${ico('calendar', 'var(--text-muted)')} ${linked.length} scheduled</span>
        <span class="db-prog-stat-item">${ico('users', 'var(--text-muted)')} ${teacherCount} teacher(s)</span>
      </div>
      <div class="db-prog-coverage-wrap">
        <div class="db-prog-coverage-label">
          <span>Schedule Coverage</span>
          <b>${pct}%</b>
        </div>
        <div class="db-prog-progress-bar">
          <div class="db-prog-progress-fill ${coverageColorClass}" style="width: ${pct}%"></div>
        </div>
      </div>
      <div class="db-prog-footer">
        <button class="db-prog-btn" onclick="openProgram('${p.id}')">Quick Open</button>
      </div>
    </div>`;
  }).join('');

  return `<div class="db-card">
    <div class="db-card-header">
      <div class="db-card-title">${ico('book', 'var(--accent)')}<span>Class Programs Matrix</span></div>
      <button class="db-card-action-btn" onclick="openSchedulerHome()">View All Programs</button>
    </div>
    ${cards ? `<div class="db-programs-grid">${cards}</div>` : `<div class="ultraEmpty">No class programs encoded yet. Create a program to begin.</div>`}
  </div>`;
}

function dashboardConflictsHtml(){
  let d=diag(), conflicts=d.conflicts;
  let data=analyticsData();
  
  let body='';
  if (conflicts.length > 0) {
    let list = conflicts.slice(0, 4);
    body = `<div class="db-conflict-list">
      ${list.map(c => `
        <div class="db-conflict-item" onclick="highlightConflict('${c.a.id}', '${c.b.id}')">
          <div class="db-conflict-title-row">
            ${ico('alert', 'var(--danger)')}
            <span>Teacher Double-Booking</span>
          </div>
          <div class="db-conflict-desc">
            <b>${esc(c.teacher)}</b> is double-booked at <b>${esc(c.time)}</b> on ${esc(c.subjectA)} (${esc(c.gradeA)}${c.sectionA?' - '+esc(c.sectionA):''}) and ${esc(c.subjectB)} (${esc(c.gradeB)}${c.sectionB?' - '+esc(c.sectionB):''}).
          </div>
          <div class="db-conflict-jump-hint">Click to resolve in matrix →</div>
        </div>
      `).join('')}
      ${conflicts.length > 4 ? `<div style="text-align:center; font-size:11.5px; color:var(--text-muted); font-weight:700;">+ ${conflicts.length - 4} more conflict(s) detected.</div>` : ''}
    </div>`;
  } else if (data.missingTeacher > 0 || data.missingSubject > 0) {
    let warnings = [];
    if (data.missingTeacher > 0) {
      warnings.push(`
        <div class="db-conflict-item" onclick="openSchedulerHome()" style="border-color:var(--warning-border); background:var(--warning-bg);">
          <div class="db-conflict-title-row" style="color:var(--warning-text);">
            ${ico('alert', 'var(--warning)')}
            <span>Teacher Assignment Missing</span>
          </div>
          <div class="db-conflict-desc" style="color:var(--warning-text);">
            <b>${data.missingTeacher}</b> scheduled block(s) are missing an assigned teacher.
          </div>
          <div class="db-conflict-jump-hint" style="color:var(--warning-text);">Click to review schedules →</div>
        </div>
      `);
    }
    if (data.missingSubject > 0) {
      warnings.push(`
        <div class="db-conflict-item" onclick="openSchedulerHome()" style="border-color:var(--warning-border); background:var(--warning-bg);">
          <div class="db-conflict-title-row" style="color:var(--warning-text);">
            ${ico('alert', 'var(--warning)')}
            <span>Subject Assignment Blank</span>
          </div>
          <div class="db-conflict-desc" style="color:var(--warning-text);">
            <b>${data.missingSubject}</b> scheduled block(s) have blank subject designations.
          </div>
          <div class="db-conflict-jump-hint" style="color:var(--warning-text);">Click to review schedules →</div>
        </div>
      `);
    }
    body = `<div class="db-conflict-list">${warnings.join('')}</div>`;
  } else {
    body = `<div class="db-conflict-empty">
      <div class="db-conflict-empty-icon">
        ${ico('refresh', 'var(--success)')}
      </div>
      <div class="db-conflict-empty-title">All Conflict-Free!</div>
      <div class="db-conflict-empty-desc">No double-bookings or missing assignments detected in active schedules.</div>
    </div>`;
  }

  return `<div class="db-card">
    <div class="db-card-header">
      <div class="db-card-title">${ico('alert', 'var(--danger)')}<span>Schedule Health Monitor</span></div>
      ${conflicts.length > 0 ? `<span class="statusPill status-bad">${conflicts.length} conflict(s)</span>` : `<span class="statusPill status-good">Healthy</span>`}
    </div>
    ${body}
  </div>`;
}

function dashboardOngoingHtml(){
  let rows=ongoingClasses();
  let body='';
  if (rows.length > 0) {
    body = `<div class="db-ongoing-list">
      ${rows.slice(0, 4).map(x => {
        let sec=x.c.sectionId ? ` - ${esc(get(state.sections,x.c.sectionId).name)}` : '';
        let room=x.tea.room ? ` • Room: ${esc(x.tea.room)}` : '';
        return `<div class="db-ongoing-item">
          <div class="db-ongoing-left">
            <div class="db-ongoing-time">${to12(x.ts.start)} – ${to12(x.ts.end)}</div>
            <div class="db-ongoing-sub">${esc(x.sub.name)}</div>
            <div class="db-ongoing-meta">${esc(x.c.grade)}${sec}${room}</div>
          </div>
          <div class="db-ongoing-badge">
            <span class="db-ongoing-badge-pulse"></span>
            <span>Live</span>
          </div>
        </div>`;
      }).join('')}
      ${rows.length > 4 ? `<div style="text-align:center; font-size:11.5px; color:var(--text-muted); font-weight:700;">+ ${rows.length - 4} more ongoing classes.</div>` : ''}
    </div>`;
  } else {
    body = `<div class="db-ongoing-empty">
      No classes ongoing right now (based on computer local time).
    </div>`;
  }

  return `<div class="db-card">
    <div class="db-card-header">
      <div class="db-card-title">${ico('clock', 'var(--accent)')}<span>Real-Time Timetable Monitor</span></div>
      <span class="db-prog-status-badge ${rows.length ? 'ready' : 'empty'}">${rows.length} active</span>
    </div>
    ${body}
  </div>`;
}

function dashboardTeacherLoadHtml(){
  let list=loads().sort((a,b)=>String(a.teacher.name||'').localeCompare(String(b.teacher.name||'')));
  let body = '';
  
  if (list.length > 0) {
    body = `<div class="db-teacher-list">
      ${list.map(l => {
        let st=loadStatus(l.minutes);
        let colorClass = st.kind === 'overload' ? 'overload' : st.kind === 'underload' ? 'underload' : 'met';
        let pct = Math.min(100, Math.round((l.minutes / 360) * 100));
        let pos = l.teacher.position ? l.teacher.position : 'Teacher';
        
        return `<div class="db-teacher-item">
          <div class="db-teacher-header">
            <div class="db-teacher-profile">
              <span class="db-teacher-avatar" style="background:${teacherColor(l.teacher.color)}">
                ${esc(initials(l.teacher.name))}
              </span>
              <div>
                <b style="font-size:12.5px;">${esc(l.teacher.name)}</b>
                <div style="font-size:10.5px; color:var(--text-muted); font-weight:600;">${esc(pos)}</div>
              </div>
            </div>
            <div class="db-teacher-load-stats">
              <b>${l.minutes}m</b> / 360m
            </div>
          </div>
          <div class="db-load-bar-wrap">
            <div class="db-load-bar ${colorClass}" style="width: ${pct}%" title="${esc(st.label)}: ${esc(st.detail)}"></div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  } else {
    body = `<div class="db-ongoing-empty">No teachers encoded yet. Go to Settings to add.</div>`;
  }

  return `<div class="db-card">
    <div class="db-card-header">
      <div class="db-card-title">${ico('users', 'var(--accent)')}<span>Teacher Utilization Summary</span></div>
      <button class="db-card-action-btn" onclick="openSummaryView()">Full Report</button>
    </div>
    ${body}
  </div>`;
}

function renderDashboard(){
  viewTitle.textContent='Dashboard';
  viewSub.textContent='Class Program Scheduler overview and quick actions.';
  viewControls.innerHTML='';
  
  content.innerHTML=`<div class="db-page">
    ${dashboardHeroHtml()}
    ${dashboardMetricsHtml()}
    <div class="db-split-grid">
      <div class="db-main-col" style="display:flex; flex-direction:column; gap:24px;">
        ${dashboardReadinessHtml()}
        ${dashboardProgramsHtml()}
      </div>
      <div class="db-side-col" style="display:flex; flex-direction:column; gap:24px;">
        ${dashboardConflictsHtml()}
        ${dashboardOngoingHtml()}
        ${dashboardTeacherLoadHtml()}
      </div>
    </div>
  </div>`;
}
function renderScheduler(){
  let p=state.programs.find(x=>x.id===state.activeProgramId);
  if(p)return renderProgramMatrix(p);
  viewTitle.textContent='Class Scheduler';
  viewSub.textContent='Select a class program from the expanded sidebar or create a new one.';
  viewControls.innerHTML=`<button class="btn primary" onclick="openProgramModal()">${ico('plus','#fff')} Add Class Program</button>`;
  
  let d=diag(),programs=schedulerFilteredPrograms(),filter=schedulerFilterDefault(),view=state.schedulerProgramsView||'grid',cards=programs.map(p=>programCardHtml(p,'scheduler')).join('');
  
  let emptyStateHtml=`
    <div class="schedulerEmptyState">
      <div class="schedulerEmptyIcon">${ico('calendar','currentColor')}</div>
      <h3 class="schedulerEmptyTitle">No Class Programs Found</h3>
      <p class="schedulerEmptyDesc">There are no class programs matching the active filter ("${esc(filter)}"). Start by creating a new class program or checking other filters.</p>
      <button class="btn primary" onclick="openProgramModal()" style="margin-top:8px">${ico('plus','#fff')} Add Class Program</button>
    </div>`;

  content.innerHTML=`<div class="schedulerPanel">
    <div class="schedulerPanelBody">
      ${inlineDiagnostics()}
      <div class="schedulerListHead">
        <div>
          <div class="schedulerListTitle">Class Programs</div>
          <div class="schedulerListSub">Custom advisers are managed in Settings → Advisers.</div>
        </div>
        <div class="schedulerToolbar">
          <button class="viewToggle ${view==='grid'?'active':''}" onclick="setProgramViewMode('grid')" title="Grid view">${ico('grid','currentColor')}</button>
          <button class="viewToggle ${view==='list'?'active':''}" onclick="setProgramViewMode('list')" title="List view">${ico('list','currentColor')}</button>
          <select class="schedulerFilterSelect" onchange="toggleSchedulerFilterSelect(this.value)">
            <option value="all" ${filter==='all'?'selected':''}>All Programs</option>
            <option value="load" ${filter==='load'?'selected':''}>Load Counted</option>
            <option value="display" ${filter==='display'?'selected':''}>Display Only</option>
            <option value="kinder" ${filter==='kinder'?'selected':''}>Kindergarten</option>
            <option value="g12" ${filter==='g12'?'selected':''}>Grades 1–2</option>
            <option value="g36" ${filter==='g36'?'selected':''}>Grades 3–6</option>
            <option value="jhs" ${filter==='jhs'?'selected':''}>Junior High</option>
          </select>
        </div>
      </div>
      ${cards?`<div class="schedulerProgramsGrid ${view==='list'?'listView':''}">${cards}</div>`:emptyStateHtml}
    </div>
  </div>`;
  applySearch();
}
function programTypeLabel(t){return ({single:'Single Grade Program',multi_section:'Single Grade with Multiple Sections',multigrade:'Multigrade Program',kindergarten:'Kindergarten Program',custom:'Custom Program'}[t]||'Class Program')}
function openProgram(id){state.activeProgramId=id;state.schedulerExpanded=true;activeView='scheduler';state.activeTab='scheduler';let p=state.programs.find(x=>x.id===id);if(p){p.group=normGroup(p.group);ensureGroupDefaults(p.group)}save()}
function backToPrograms(){state.activeProgramId='';state.schedulerExpanded=true;save()}
function defaultGroupForGrade(g){if(g==='Kindergarten')return 'kinder';if(['Grade 1','Grade 2'].includes(g))return 'g12';return 'g36'}
function openProgramModal(){editProgramId=null;programModalTitle.textContent='Add Class Program';pSaveBtn.textContent='Create Program';pGrade.innerHTML=state.grades.map(g=>`<option>${esc(g)}</option>`).join('');pGrades.innerHTML=state.grades.map(g=>`<label class="checkLine"><input type="checkbox" value="${esc(g)}"> ${esc(g)}</label>`).join('');pName.value='';pType.value='single';pGrade.value=activeGrade||'Grade 4';if(typeof pLoadCount!=='undefined')pLoadCount.checked=true;updateProgramForm();programModal.classList.add('show')}
function editProgram(id){let p=state.programs.find(x=>x.id===id);if(!p)return;editProgramId=id;programModalTitle.textContent='Edit Class Program';pSaveBtn.textContent='Save Program';pGrade.innerHTML=state.grades.map(g=>`<option>${esc(g)}</option>`).join('');pGrades.innerHTML=state.grades.map(g=>`<label class="checkLine"><input type="checkbox" value="${esc(g)}" ${(p.grades||[]).includes(g)?'checked':''}> ${esc(g)}</label>`).join('');pName.value=p.name;pType.value=p.type;pGrade.value=(p.grades||[])[0]||'Grade 4';pGroup.value=normGroup(p.group||defaultGroupForGrade(pGrade.value));if(typeof pLoadCount!=='undefined')pLoadCount.checked=p.countsTowardLoad!==false;updateProgramForm(p);programModal.classList.add('show')}
function closeProgramModal(){programModal.classList.remove('show');editProgramId=null}
function updateProgramForm(existing=null){let type=pType.value,grade=pGrade.value||'Grade 4';if(type==='kindergarten'){pGrade.value='Kindergarten';grade='Kindergarten'}if(type==='single'||type==='multi_section'||type==='kindergarten')pGroup.value=normGroup(defaultGroupForGrade(grade));pSingleGradeWrap.style.display=(type==='multigrade'||type==='custom')?'none':'block';pMultiGradeWrap.style.display=(type==='multigrade'||type==='custom')?'block':'none';pSectionWrap.style.display=(type==='multi_section')?'block':'none';let selected=(existing&&existing.sectionIds)||[];let secs=state.sections.filter(s=>s.grade===pGrade.value);let list=secs.length?secs.map(s=>`<label class="checkLine"><input type="checkbox" value="${s.id}" ${selected.includes(s.id)?'checked':''}> ${esc(s.grade)} - ${esc(s.name)}</label>`).join(''):'<div class="muted">No sections found for this grade yet.</div>';pSections.innerHTML=list+`<div class="quickSectionAdd"><input id="quickSectionName" class="input" placeholder="Add section for ${esc(pGrade.value)} e.g. A"><button class="btn" onclick="addSectionFromProgramModal('${esc(pGrade.value)}')">+ Add Section</button></div>`;if(type==='multigrade'){pNote.innerHTML='ⓘ Multigrade programs do not use class sections.';pNote.style.display='flex';}else if(type==='multi_section'){pNote.innerHTML='ⓘ Tip: Add sections here or in Settings → Sections, then tick sections to include.';pNote.style.display='flex';}else{pNote.style.display='none';}}
function saveProgram(){let type=pType.value,old=state.programs.find(x=>x.id===editProgramId);let grades=(type==='multigrade'||type==='custom')?[...pGrades.querySelectorAll('input:checked')].map(i=>i.value):[pGrade.value];if(!grades.length){toastMsg('Select at least one grade level.');return}let useSections=type==='multi_section',sectionIds=useSections?[...pSections.querySelectorAll('input:checked')].map(i=>i.value):[];let name=(pName.value||'').trim()||programTypeLabel(type).replace(' Program','')+' - '+grades.join(', ');let rec={id:editProgramId||uid('prog'),name,type,grades,useSections,sectionIds,group:normGroup(pGroup.value||defaultGroupForGrade(grades[0])),advisers:old?.advisers||[],order:Number.isFinite(Number(old?.order))?Number(old.order):(state.programs||[]).length,countsTowardLoad:(typeof pLoadCount==='undefined')?true:pLoadCount.checked,viewType:((typeof pLoadCount==='undefined')?true:pLoadCount.checked)?'master':'learner'};ensureGroupDefaults(rec.group);if(type==='multigrade'){rec.useSections=false;rec.sectionIds=[]}if(editProgramId)state.programs=state.programs.map(x=>x.id===editProgramId?rec:x);else state.programs.push(rec);normalizeProgramOrder();state.activeProgramId=rec.id;state.schedulerExpanded=true;activeView='scheduler';state.activeTab='scheduler';closeProgramModal();save()}
function programSlotIds(p){return slotsForProgram(p).map(ts=>ts.id)}
function classBelongsToProgram(c,p){if(!p)return false;if(c.programId)return c.programId===p.id;let slotOk=programSlotIds(p).includes(c.timeSlotId),gradeOk=(p.grades||[]).includes(c.grade);if(!slotOk||!gradeOk)return false;if(p.useSections){return (p.sectionIds||[]).includes(c.sectionId||'')}return true}
function programScheduledCount(p){return state.classes.filter(c=>classBelongsToProgram(c,p)).length}
function deleteProgram(id){let p=state.programs.find(x=>x.id===id),count=programScheduledCount(p);askConfirm('Delete class program',`This will delete the class program setup and ${count} scheduled subject(s) connected to it. Teacher workload will be updated automatically. Continue?`,()=>{state.programs=state.programs.filter(x=>x.id!==id);normalizeProgramOrder();state.classes=state.classes.filter(c=>!classBelongsToProgram(c,p));if(state.activeProgramId===id)state.activeProgramId='';toastMsg('Class program and connected scheduled subjects deleted.');save()})}
function columnsForProgram(p){if(p.useSections){let secs=(p.sectionIds&&p.sectionIds.length?state.sections.filter(s=>p.sectionIds.includes(s.id)):state.sections.filter(s=>p.grades.includes(s.grade)));return secs.map(s=>({label:`${s.grade} - ${s.name}`,grade:s.grade,sectionId:s.id}))}return (p.grades||[]).map(g=>({label:g,grade:g,sectionId:''}))}
function renderProgramMatrix(p){
  p.group=normGroup(p.group||'g36');
  if(!slotsForProgram(p).length)ensureGroupDefaults(p.group);
  let slots=slotsForProgram(p),cols=columnsForProgram(p);
  viewTitle.textContent='';
  viewSub.textContent='';
  viewControls.innerHTML=`<button class="btn" onclick="toggleFocusMode()" title="Toggle Focus Mode">${document.body.classList.contains('focusMode')?ico('minimize','currentColor')+' Exit Focus':ico('maximize','currentColor')+' Focus Mode'}</button><button class="btn" onclick="backToPrograms()">${ico('chevron-left','currentColor')} Back to Programs</button><button class="btn" onclick="editProgram('${p.id}')">${ico('settings','currentColor')} Edit Program</button><button class="btn primary" onclick="addSlotAtEnd('${p.group||'g36'}','${p.id}')">${ico('plus','#fff')} Add Time Slot</button>`;
  if(!slots.length||!cols.length){
    content.innerHTML=`<div class="empty">This program needs at least one time slot and one column.</div>`;
    return;
  }
  
  let totalExpected = slots.filter(s=>s.type!=='universal').length * cols.length;
  let scheduledCount = state.classes.filter(c=>classBelongsToProgram(c,p)).length;
  let pct = totalExpected > 0 ? Math.round((scheduledCount / totalExpected) * 100) : 0;
  let badgeClass = p.type==='multigrade'?'MG':p.type==='multi_section'?'SEC':p.type==='kindergarten'?'K':'SG';
  let badgeText = p.type==='multigrade'?'MG':p.type==='multi_section'?'SECTIONS':p.type==='kindergarten'?'KINDER':'SINGLE GRADE';
  
  let adviserElements=cols.map(c=>{
    let name=adviserForColumn(p,c.grade,c.sectionId);
    if(!name)return '';
    let init=initials(name)||'--';
    let color=palette[Array.from(name).reduce((acc,char)=>acc+char.charCodeAt(0),0)%palette.length];
    return `<div class="schedulerAdviserPill" title="${esc(c.label)} Adviser: ${esc(name)}">
      <div class="schedulerAdviserAvatar" style="background:${color}">${esc(init)}</div>
      <span>${esc(c.label)}: <b>${esc(name)}</b></span>
    </div>`;
  }).filter(Boolean).join('');
  
  let headerCardHtml=`
    <div class="schedulerHeaderBlock">
      <div class="schedulerHeaderTop">
        <div class="schedulerHeaderInfo">
          <div class="schedulerHeaderTitleRow">
            <h2 class="schedulerHeaderTitle">${esc(p.name)}</h2>
            <span class="schedulerHeaderBadge ${badgeClass}">${esc(badgeText)}</span>
          </div>
          <div class="schedulerHeaderSub">
            <span>${ico('calendar','currentColor')}${esc(programTypeLabel(p.type))}</span>
            <span>•</span>
            <span>${ico('users','currentColor')}${esc(programGradesLabel(p.grades))}</span>
            <span>•</span>
            <span>${programLoadBadge(p)}</span>
          </div>
        </div>
        <div class="schedulerHeaderProgress">
          <div class="schedulerProgressLabel">
            <span>Timetable Completeness</span>
            <span>${scheduledCount}/${totalExpected} slots (${pct}%)</span>
          </div>
          <div class="schedulerProgressTrack">
            <div class="schedulerProgressFill" style="width:${pct}%"></div>
          </div>
        </div>
      </div>
      ${adviserElements?`
        <div class="schedulerHeaderAdvisers">
          <div class="schedulerAdvisersTitle">Advisory Assignments</div>
          <div class="schedulerAdvisersList">${adviserElements}</div>
        </div>`:''}
    </div>`;
  
  let html=`${inlineDiagnostics()}${headerCardHtml}<table><thead><tr><th class="timecol">Time</th>${cols.map(c=>`<th>${esc(c.label)}<div class="muted" style="text-transform:none;letter-spacing:0;margin-top:4px">${esc(adviserForColumn(p,c.grade,c.sectionId)||'No adviser set')}</div></th>`).join('')}</tr></thead><tbody>`;
  slots.forEach(ts=>{
    html+=`<tr><td class="timecol"><div class="timeCell">${timeCell(ts,p.group||'g36',p.id)}</div></td>`;
    if(ts.type==='universal')html+=`<td colspan="${cols.length}">${universalActivityHtml(ts.label)}</td>`;
    else cols.forEach(col=>{
      let items=state.classes.filter(c=>classBelongsToProgram(c,p)&&c.grade===col.grade&&c.timeSlotId===ts.id&&(!c.day||c.day==='master')&&(p.useSections?(c.sectionId||'')===col.sectionId:true));
      html+=`<td><div class="drop" ondragover="allowDrop(event)" ondragleave="leaveDrop(event)" ondrop="dropClass(event,'${ts.id}','${esc(col.grade)}','${esc(col.sectionId)}')">`;
      items.forEach(c=>html+=block(c,ts.id,col.grade,col.sectionId));
      if(items.length===0)html+=`<button class="add" onclick="openClassModal('${ts.id}','${esc(col.grade)}','${esc(col.sectionId)}')">${ico('plus','currentColor')} Magic Slot</button>`;
      html+=`</div></td>`
    });
    html+='</tr>'
  });
  content.innerHTML=html+'</tbody></table>';
  applySearch();
}
function menuButton(items){let id='menu-'+(++menuCounter);menuRegistry[id]=items;return `<button class="kebab" onclick="toggleContextMenu(event,'${id}')" onmouseenter="hoverContextMenu(event,'${id}')" onmouseleave="scheduleMenuClose()">⋯</button>`} function hoverContextMenu(e,id){cancelMenuClose();showContextMenu(e.currentTarget,id)} function toggleContextMenu(e,id){e.stopPropagation();cancelMenuClose();if(activeMenuId===id&&floatingMenu.classList.contains('show'))return hideContextMenu();showContextMenu(e.currentTarget,id)} function showContextMenu(anchor,id){activeMenuId=id;let items=menuRegistry[id]||[];floatingMenu.innerHTML=items.map((it,i)=>`<button class="${it.danger?'danger':''}" onclick="runMenuAction('${id}',${i})">${esc(it.label)}</button>`).join('');floatingMenu.classList.add('show');let r=anchor.getBoundingClientRect(),mw=190,mh=Math.max(44,items.length*40);floatingMenu.style.left=Math.min(window.innerWidth-mw-8,Math.max(8,r.right-mw))+'px';let top=r.bottom+6;if(top+mh>window.innerHeight-8)top=Math.max(8,r.top-mh-6);floatingMenu.style.top=top+'px'} function runMenuAction(id,i){let item=(menuRegistry[id]||[])[i];hideContextMenu();if(item&&typeof item.action==='function')item.action()} function scheduleMenuClose(){cancelMenuClose();closeTimer=setTimeout(hideContextMenu,380)} function cancelMenuClose(){if(closeTimer)clearTimeout(closeTimer)} function hideContextMenu(){floatingMenu.classList.remove('show');floatingMenu.innerHTML='';activeMenuId=null} document.addEventListener('click',e=>{if(!e.target.closest('.menu')&&!e.target.closest('.kebab'))hideContextMenu();let wrap=document.getElementById('topSchoolYearDropdown'),menu=document.getElementById('topSchoolYearMenu');if(wrap&&menu&&!e.target.closest('#topSchoolYearDropdown')){menu.classList.remove('show');wrap.classList.remove('active')}});window.addEventListener('scroll',hideContextMenu,true);window.addEventListener('resize',hideContextMenu);
function renderMatrix(g){
  currentGroup=g;
  let grades=gradesForGroup(g),slots=slotsForGroup(g);
  viewTitle.textContent=g==='kinder'?'Kindergarten Master Program':g==='g12'?'Grades 1–2 Master Program':'Grades 3–6 Master Program';
  viewSub.textContent='Premium blank version: set up teachers, subjects, and time slots, or import a backup.';
  viewControls.innerHTML=`<button class="btn primary" onclick="addSlotAtEnd('${g}')">${ico('plus','#fff')} Add Time Slot</button>`;
  if(!slots.length){
    content.innerHTML=`<div class="empty">No time slots yet. Click <b>Add Time Slot</b> to start building the timetable, or use <b>Import Backup</b>.</div>`;
    return;
  }
  let html=`<table><thead><tr><th class="timecol">Time</th>${grades.map(gr=>`<th>${esc(gr)}<div class="muted" style="text-transform:none;letter-spacing:0;margin-top:4px">Adviser: ${esc(get(state.teachers,state.advisers[gr]).name)}</div></th>`).join('')}</tr></thead><tbody>`;
  slots.forEach(ts=>{
    html+=`<tr><td class="timecol"><div class="timeCell">${timeCell(ts,g)}</div></td>`;
    if(ts.type==='universal')html+=`<td colspan="${grades.length}">${universalActivityHtml(ts.label)}</td>`;
    else grades.forEach(gr=>{
      let items=state.classes.filter(c=>c.grade===gr&&c.timeSlotId===ts.id&&(!c.day||c.day==='master'));
      html+=`<td><div class="drop" ondragover="allowDrop(event)" ondragleave="leaveDrop(event)" ondrop="dropClass(event,'${ts.id}','${esc(gr)}')">`;
      items.forEach(c=>block(c,ts.id,gr));
      if(items.length===0)html+=`<button class="add" onclick="openClassModal('${ts.id}','${esc(gr)}')">${ico('plus','currentColor')} Magic Slot</button>`;
      html+=`</div></td>`
    });
    html+='</tr>'
  });
  content.innerHTML=html+'</tbody></table>';
  applySearch();
}
function timeCell(ts,g,programId=''){let items=[{label:'Edit time slot',action:()=>openSlotModal(ts.id)},{label:'Add row below',action:()=>addSlotAfter(ts.id,g,programId)},{label:'Delete row',danger:true,action:()=>deleteSlot(ts.id,g)}];return `<div class="timeLine"><div><div class="timeTitle">${to12(ts.start)}–${to12(ts.end)}</div><div class="timeMeta">${ts.mins} min · ${esc(ts.type)}</div></div>${menuButton(items)}</div>`}
function openSlotModal(id){let ts=state.timeSlots.find(x=>x.id===id);if(!ts)return;editSlotId=id;slotStart.value=ts.start||'07:30';slotMins.value=ts.mins||40;slotLabel.value=ts.label||'';slotType.value=ts.type||'academic';slotGroup.value=normGroup(ts.group||'g36');updateSlotEndPreview();slotModal.classList.add('show')}
function slotSequenceForCascade(ts){let p=ts.programId?state.programs.find(x=>x.id===ts.programId):null,seq=p?slotsForProgram(p):slotsForGroup(normGroup(ts.group||'g36'));let indexMap=new Map(state.timeSlots.map((x,i)=>[x.id,i]));return seq.slice().sort((a,b)=>(a.start||'').localeCompare(b.start||'')||(indexMap.get(a.id)||0)-(indexMap.get(b.id)||0))}
function cascadeFollowingSlots(slotId){let ts=state.timeSlots.find(x=>x.id===slotId);if(!ts)return;let seq=slotSequenceForCascade(ts),idx=seq.findIndex(x=>x.id===slotId);if(idx<0)return;seq[idx].end=addMins(seq[idx].start||'07:30',Number(seq[idx].mins)||0);for(let i=idx+1;i<seq.length;i++){seq[i].start=seq[i-1].end;seq[i].end=addMins(seq[i].start,Number(seq[i].mins)||0)}} function closeSlotModal(){slotModal.classList.remove('show');editSlotId=null} function updateSlotEndPreview(){let end=addMins(slotStart.value||'07:30',Number(slotMins.value)||0);if(typeof slotEndPreview!=='undefined'&&slotEndPreview)slotEndPreview.textContent=`Auto end time: ${to12(end)}`} function saveSlotEdit(){let ts=state.timeSlots.find(x=>x.id===editSlotId);if(!ts)return closeSlotModal();let m=Number(slotMins.value)||40;ts.start=slotStart.value||'07:30';ts.mins=m;ts.end=addMins(ts.start,m);ts.label=slotLabel.value||'';ts.type=slotType.value||'academic';ts.group=normGroup(slotGroup.value||'g36');cascadeFollowingSlots(ts.id);closeSlotModal();toastMsg('Time slot updated. Following time slots auto-adjusted.');save()} function addSlotAfter(id,g,programId=''){g=normGroup(g);let p=programId?state.programs.find(x=>x.id===programId):null,seq=p?slotsForProgram(p):slotsForGroup(g),idx=seq.findIndex(x=>x.id===id),base=seq[idx]||seq.at(-1),m=40,start=base?base.end:defaultStartForGroup(g),slot={id:uid('ts'),start,mins:m,end:addMins(start,m),label:'',type:'academic',group:g,programId:programId||''};let real=state.timeSlots.findIndex(x=>x.id===id);if(real>=0)state.timeSlots.splice(real+1,0,slot);else state.timeSlots.push(slot);cascadeFollowingSlots(slot.id);toastMsg('Time slot added and following time slots auto-adjusted.');save()} function addSlotAtEnd(g,programId=''){g=normGroup(g);let p=programId?state.programs.find(x=>x.id===programId):null,seq=p?slotsForProgram(p):slotsForGroup(g),last=seq.at(-1),start=last?last.end:defaultStartForGroup(g),m=40;state.timeSlots.push({id:uid('ts'),start,mins:m,end:addMins(start,m),label:'',type:'academic',group:g,programId:programId||''});if(p)p.group=g;toastMsg(programId?'Time slot added to this class program.':'Time slot added.');save()} function deleteSlot(id,g){askConfirm('Delete time slot','Classes assigned to this time slot will also be cleared.',()=>{state.timeSlots=state.timeSlots.filter(x=>x.id!==id);state.classes=state.classes.filter(c=>c.timeSlotId!==id);save()})}
function block(c,slotId,grade,sectionId=''){
  let sub=get(state.subjects,c.subjectId),tea=get(state.teachers,c.teacherId),ts=get(state.timeSlots,c.timeSlotId),tc=teacherColor(tea),muted=selectedTeacher&&selectedTeacher!==c.teacherId?'opacity:.25':'';
  let init=initials(tea.name)||'--';
  let roomLabel=c.room||tea.room?`Room: ${esc(c.room||tea.room)}`:'';
  let posLabel=tea.position?esc(tea.position):'';
  let items=[{label:'Add another subject',action:()=>openClassModal(slotId,grade,sectionId)},{label:'Edit class',action:()=>editClass(c.id)},{label:'Delete class',danger:true,action:()=>deleteClass(c.id)}];
  return `<div class="block" data-class-id="${c.id}" draggable="true" ondragstart="dragClass(event,'${c.id}')" style="--card-color:${tc};border-color:${tc};background:${rgba(tc,.07)} !important;${muted}">
    <div class="classHead">
      <div class="classSubject">${esc(sub.name)}</div>
      ${menuButton(items)}
    </div>
    <div class="blockTeacherRow">
      <div class="blockTeacherAvatar" style="background:${tc}">${esc(init)}</div>
      <div class="blockTeacherName" title="${esc(tea.name)}">${esc(tea.name)}</div>
    </div>
    <div class="blockMetaRow">
      ${posLabel?`<span class="blockMetaPill" title="${esc(posLabel)}">${ico('users','currentColor')}${esc(posLabel)}</span>`:''}
      ${roomLabel?`<span class="blockMetaPill" title="${esc(roomLabel)}">${ico('home','currentColor')}${esc(roomLabel)}</span>`:''}
    </div>
    <div class="blockMinsBadge">${ts.mins||0}m</div>
  </div>`;
}
function renderLevelPills(tags){return tags.length?`<div class="levelPills">${tags.map(t=>`<span class="levelPill level-${t}">${t}</span>`).join('')}</div>`:'—'}
function subjectPillsForTeacher(r){if(!r.items.length)return `<span class="noSubjects">No assigned subjects</span>`;return `<div class="subjectPills">${r.items.map(c=>{let sub=get(state.subjects,c.subjectId),ts=get(state.timeSlots,c.timeSlotId),sec=c.sectionId?` - ${get(state.sections,c.sectionId).name}`:'';return `<span class="subjectPill"><b>${esc(sub.name)}</b>&nbsp;(${esc(c.grade)}${esc(sec)} - ${ts.mins||0}m)</span>`}).join('')}</div>`}
function primaryAdvisoryLabel(r){return (r.adviserEntries&&r.adviserEntries.length)?r.adviserEntries[0].label:''}
function advisorySortTuple(r){let label=primaryAdvisoryLabel(r);return [gradeSortValue(label),sectionSortText(label),r.teacher.name]}
function summaryRowText(r){return [r.teacher.name,(r.levelTags||[]).join(' '),r.adviserEntries.map(a=>a.label).join(' '),r.items.map(c=>`${get(state.subjects,c.subjectId).name} ${c.grade}`).join(' '),loadStatus(r.minutes).label].join(' ').toLowerCase()}
function filterSummaryRows(rows){let q=(summarySearch||'').toLowerCase().trim();return rows.filter(r=>{let st=loadStatus(r.minutes).kind,hasAdv=(r.adviserEntries||[]).length>0,levelOk=summaryLevel==='all'||(r.levelTags||[]).includes(summaryLevel),statusOk=summaryStatus==='all'||st===summaryStatus,advOk=summaryAdviser==='all'||(summaryAdviser==='advisers'?hasAdv:!hasAdv),searchOk=!q||summaryRowText(r).includes(q);return levelOk&&statusOk&&advOk&&searchOk})}
function sortSummaryRows(rows){let arr=[...rows];arr.sort((a,b)=>{let sa=loadStatus(a.minutes).kind,sb=loadStatus(b.minutes).kind,rank={overload:0,met:1,underload:2};if(summarySort==='name')return a.teacher.name.localeCompare(b.teacher.name);if(summarySort==='loadHigh')return b.minutes-a.minutes;if(summarySort==='loadLow')return a.minutes-b.minutes;if(summarySort==='subjectsHigh')return b.blocks-a.blocks;if(summarySort==='underloadFirst')return (sa==='underload'?0:1)-(sb==='underload'?0:1)||a.minutes-b.minutes;if(summarySort==='statusOver')return (rank[sa]-rank[sb])||b.minutes-a.minutes;let aa=advisorySortTuple(a),bb=advisorySortTuple(b);return (aa[0]-bb[0])||String(aa[1]).localeCompare(String(bb[1]))||String(aa[2]).localeCompare(String(bb[2]))});return arr}
function renderSummaryControls(){return `<div class="summaryControls"><input class="input summarySearch" value="${esc(summarySearch)}" placeholder="Search teacher, subject, advisory, or status..." oninput="summarySearch=this.value;renderSummary()"><select class="input" onchange="summarySort=this.value;renderSummary()"><option value="advisory" ${summarySort==='advisory'?'selected':''}>Sort: Advisory Grade + Section</option><option value="statusOver" ${summarySort==='statusOver'?'selected':''}>Sort: Overloaded first</option><option value="underloadFirst" ${summarySort==='underloadFirst'?'selected':''}>Sort: Underloaded first</option><option value="loadHigh" ${summarySort==='loadHigh'?'selected':''}>Sort: Load high to low</option><option value="loadLow" ${summarySort==='loadLow'?'selected':''}>Sort: Load low to high</option><option value="subjectsHigh" ${summarySort==='subjectsHigh'?'selected':''}>Sort: Subject count</option><option value="name" ${summarySort==='name'?'selected':''}>Sort: Name A-Z</option></select><select class="input" onchange="summaryLevel=this.value;renderSummary()"><option value="all" ${summaryLevel==='all'?'selected':''}>All Levels</option><option value="K" ${summaryLevel==='K'?'selected':''}>K</option><option value="ES" ${summaryLevel==='ES'?'selected':''}>ES</option><option value="JHS" ${summaryLevel==='JHS'?'selected':''}>JHS</option><option value="SHS" ${summaryLevel==='SHS'?'selected':''}>SHS</option></select><select class="input" onchange="summaryStatus=this.value;renderSummary()"><option value="all" ${summaryStatus==='all'?'selected':''}>All Status</option><option value="overload" ${summaryStatus==='overload'?'selected':''}>Overloaded</option><option value="met" ${summaryStatus==='met'?'selected':''}>Met Load</option><option value="underload" ${summaryStatus==='underload'?'selected':''}>Underloaded</option></select><select class="input" onchange="summaryAdviser=this.value;renderSummary()"><option value="all" ${summaryAdviser==='all'?'selected':''}>All Teachers</option><option value="advisers" ${summaryAdviser==='advisers'?'selected':''}>Advisers Only</option><option value="non" ${summaryAdviser==='non'?'selected':''}>Non-Advisers</option></select></div>`}
function renderSummary(){viewTitle.textContent='Teaching Load Summary';viewSub.textContent='Teaching load target is 6 hours / 360 minutes. Adviser assignment counts as 60 minutes.';viewControls.innerHTML='';let target=360,rows=sortSummaryRows(filterSummaryRows(loads()));content.innerHTML=`<div class="loadSummaryWrap">${renderSummaryControls()}<table class="loadSummaryTable"><thead><tr><th>Teacher</th><th>Level</th><th>Advisory Assignment</th><th>Scheduled Subjects</th><th>Total Teaching Load</th><th>Status</th></tr></thead><tbody>${rows.length?rows.map(r=>{let c=teacherColor(r.teacher),adv=r.adviserEntries.length?r.adviserEntries.map(x=>esc(x.label)).join('<br>'):'—',st=loadStatus(r.minutes,target),badge=r.adviserEntries.length?'<span class="adviserBadge">Adviser</span>':'',posBadge=r.teacher.position?`<span class="positionPill">${esc(r.teacher.position)}</span>`:'',subjects=subjectPillsForTeacher(r);return `<tr class="summaryRow"><td><div class="facultyCell"><span class="facultyMark" style="background:${c}"></span><div><div class="facultyName">${esc(r.teacher.name)}</div>${posBadge}${badge}</div></div></td><td>${renderLevelPills(r.levelTags||[])}</td><td class="advisoryCell">${adv}</td><td>${subjects}</td><td class="totalLoadCell"><div>${r.minutes} min</div><div class="hoursText">${(r.minutes/60).toFixed(2)} hrs</div></td><td style="text-align:center"><span class="statusPill status-${st.kind}">${st.label}<small>${st.detail}</small></span></td></tr>`}).join(''):`<tr><td colspan="6" class="empty">No teachers matched the selected filters.</td></tr>`}</tbody></table></div>`}
function sectionLabel(id){let sec=state.sections.find(s=>s.id===id);return sec?`${sec.grade} - ${sec.name}`:'No section'}
function slotLabel(id){let ts=get(state.timeSlots,id);return ts.id?`${to12(ts.start)}–${to12(ts.end)} • ${ts.mins||0} min`:''}
function showClassNotice(type,msg){classNotice.className=`classNotice show ${type||'info'}`;classNotice.innerHTML=msg}
function clearClassNotice(){classNotice.className='classNotice';classNotice.innerHTML=''}
function currentPositionText(){return `${mGrade.value||'—'} • ${slotLabel(mSlot.value)||'—'} • ${sectionLabel(mSec.value)}`}
function classConflictPreview(){if(!mTeach.value||!mSlot.value)return null;let p=activeProgram(),sameTeacher=state.classes.filter(c=>c.id!==editId&&c.teacherId===mTeach.value&&c.timeSlotId===mSlot.value&&(c.day||'master')==='master');let conflict=sameTeacher.find(c=>!(p&&isMultigradeProgram(p)&&c.programId===p.id));if(conflict){let sub=get(state.subjects,conflict.subjectId).name;return `${esc(get(state.teachers,mTeach.value).name)} already has ${esc(sub)} in ${esc(conflict.grade)} at ${esc(slotLabel(mSlot.value))}.`}let duplicate=state.classes.find(c=>c.id!==editId&&c.subjectId===mSub.value&&c.grade===mGrade.value&&c.timeSlotId===mSlot.value&&(c.sectionId||'')===(mSec.value||''));if(duplicate){return `${esc(get(state.subjects,mSub.value).name)} is already scheduled for ${esc(mGrade.value)} at ${esc(slotLabel(mSlot.value))}.`}return null}
function updateClassNotice(){let problem=classConflictPreview();if(problem)showClassNotice('error',`<b>Possible conflict:</b> ${problem}`);else showClassNotice('info',`This subject will be added to <b>${esc(currentPositionText())}</b>.`)}
function refreshSectionOptions(grade,selected=''){let opts=['<option value="">No section</option>'].concat(state.sections.filter(s=>!grade||s.grade===grade).map(s=>`<option value="${s.id}" ${selected===s.id?'selected':''}>${esc(s.name)}</option>`));mSec.innerHTML=opts.join('')}
function bindClassModalEvents(){
  mSub.onchange=()=>{ if(!editId) populateTeacherOptions(mSub.value, mSlot.value, 'master', ''); updateClassNotice(); };
  mTeach.onchange=updateClassNotice;
  mGrade.onchange=()=>{
    refreshSectionOptions(mGrade.value,mSec.value);
    let magicSubs = editId ? null : getMagicSubjectRecommendations(mGrade.value, state.activeProgramId);
    refreshSubjectOptions(mGrade.value,mSub.value, magicSubs);
    if(!editId) populateTeacherOptions(mSub.value, mSlot.value, 'master', '');
    updateClassNotice();
  };
  mSlot.onchange=()=>{ if(!editId) populateTeacherOptions(mSub.value, mSlot.value, 'master', mTeach.value); updateClassNotice(); };
  mSec.onchange=updateClassNotice;
}
function openClassModal(slot='',grade='',sectionId='',teacherId=''){
  editId=null;
  modalTitle.textContent='Add Scheduled Subject';
  let resolvedGrade=grade||activeGrade;
  let magicSubs = getMagicSubjectRecommendations(resolvedGrade, state.activeProgramId);
  mGrade.innerHTML=state.grades.map(g=>`<option>${esc(g)}</option>`).join('');
  mSlot.innerHTML=state.timeSlots.length?state.timeSlots.map(ts=>`<option value="${ts.id}">${to12(ts.start)}–${to12(ts.end)} • ${ts.mins} min</option>`).join(''):'<option value="">Add time slots first</option>';
  mGrade.value=resolvedGrade;
  mSlot.value=slot||state.timeSlots.find(x=>x.type==='academic')?.id||'';
  refreshSectionOptions(resolvedGrade,sectionId||'');
  refreshSubjectOptions(resolvedGrade,'', magicSubs);
  populateTeacherOptions(mSub.value, mSlot.value, 'master', teacherId||'');
  mSec.value=sectionId||'';
  let p=state.programs.find(x=>x.id===state.activeProgramId);
  mSec.disabled=!!(p&&p.type==='multigrade');
  bindClassModalEvents();
  updateClassNotice();
  classModal.classList.add('show');
}
function editClass(id){
  let c=state.classes.find(x=>x.id===id);
  if(!c)return;
  editId=id;
  modalTitle.textContent='Edit Scheduled Subject';
  mGrade.innerHTML=state.grades.map(g=>`<option>${esc(g)}</option>`).join('');
  mSlot.innerHTML=state.timeSlots.length?state.timeSlots.map(ts=>`<option value="${ts.id}">${to12(ts.start)}–${to12(ts.end)} • ${ts.mins} min</option>`).join(''):'<option value="">Add time slots first</option>';
  mGrade.value=c.grade;
  mSlot.value=c.timeSlotId;
  refreshSectionOptions(c.grade,c.sectionId||'');
  refreshSubjectOptions(c.grade,c.subjectId);
  populateTeacherOptions('', '', '', c.teacherId);
  mSub.value=c.subjectId;
  mSec.value=c.sectionId||'';
  let p=state.programs.find(x=>x.id===state.activeProgramId);
  mSec.disabled=!!(p&&p.type==='multigrade');
  bindClassModalEvents();
  updateClassNotice();
  classModal.classList.add('show');
}
function closeClassModal(){clearClassNotice();classModal.classList.remove('show')}
function saveClass(){
  if(!mSub.value||!mTeach.value||!mSlot.value){showClassNotice('error','Add at least one matching subject, teacher, and time slot first.');return}
  let problem=classConflictPreview();
  if(problem){showClassNotice('error',`<b>Cannot save yet:</b> ${problem}`);return}
  let p=state.programs.find(x=>x.id===state.activeProgramId);
  let existing=state.classes.find(x=>x.id===editId);
  let c={id:editId||uid('c'),subjectId:mSub.value,teacherId:mTeach.value,grade:mGrade.value,timeSlotId:mSlot.value,day:'master',sectionId:(p&&p.type==='multigrade')?'':mSec.value,programId:p?p.id:(existing?.programId||'')};
  if(editId)state.classes=state.classes.map(x=>x.id===editId?c:x);
  else state.classes.push(c);
  
  let teacher = state.teachers.find(t=>t.id===mTeach.value);
  let subject = state.subjects.find(s=>s.id===mSub.value);
  if(teacher && subject && !editId) {
    if(!teacher.subjectsTaught) teacher.subjectsTaught = [];
    if(!teacher.subjectsTaught.includes(subject.name)) teacher.subjectsTaught.push(subject.name);
  }
  
  closeClassModal();
  save();
}
function deleteClass(id){askConfirm('Delete scheduled subject','This removes the selected scheduled subject only.',()=>{state.classes=state.classes.filter(c=>c.id!==id);save()})}
function dragTeacher(e,id){dragTeacherId=id;dragId=null;e.dataTransfer.effectAllowed='copy';try{e.dataTransfer.setData('text/plain',id)}catch(err){}}
function dragClass(e,id){dragId=id;dragTeacherId=null;e.dataTransfer.effectAllowed='move'} function allowDrop(e){e.preventDefault();if(dragTeacherId)e.currentTarget.classList.add('teacherReady')} function leaveDrop(e){e.currentTarget.classList.remove('teacherReady')} function dropClass(e,slot,grade,sectionId=''){e.preventDefault();e.currentTarget.classList.remove('teacherReady');if(dragTeacherId){let teacherId=dragTeacherId;dragTeacherId=null;openClassModal(slot,grade,sectionId,teacherId);return}let c=state.classes.find(x=>x.id===dragId);if(c){let p=state.programs.find(x=>x.id===state.activeProgramId);c.timeSlotId=slot;c.grade=grade;c.sectionId=(p&&p.type==='multigrade')?'':(sectionId||c.sectionId||'');save()}} function applySearch(){let q=(search?.value||'').trim().toLowerCase();let targets=[];if(activeView==='dashboard'||(activeView==='scheduler'&&!activeProgram()))targets=[...document.querySelectorAll('.programCard')];else if(activeView==='scheduler'&&activeProgram())targets=[...document.querySelectorAll('.block')];else targets=[...document.querySelectorAll('.teacherProfileCard,.subjectCard,.sectionGradeGroup,.adviserLiteGroup')];targets.forEach(el=>{let hay=(el.dataset.search||el.innerText||'').toLowerCase();el.classList.toggle('searchHidden',!!q&&!hay.includes(q))})}
function openResetModal(){resetModal.classList.add('show')} function closeResetModal(){resetModal.classList.remove('show')} function confirmResetScheduleOnly(){askConfirm('Reset schedule only','This will clear all scheduled subjects from the schedule matrix. Teachers, subjects, school profile, sections, advisers, and custom time slots will remain.',()=>{state.classes=[];closeResetModal();toastMsg('Schedule cleared.');save()})} function confirmResetAllBlank(){askConfirm('Reset all to blank','This will clear all app data and return to a blank starter setup. Use Import Backup if you want to restore previous data.',()=>{state=migrate(JSON.parse(JSON.stringify(BLANK_STATE)));activeView='dashboard';state.schedulerExpanded=true;closeResetModal();toastMsg('App reset to blank.');save()})}
function renderSettingsNav(){let tabs=[['school','School Profile','settings'],['schoolyear','School Year & Migration','calendar'],['teachers','Teachers','users'],['subjects','Subjects','book'],['sections','Sections','book'],['advisers','Advisers','users']];settingsNav.innerHTML=tabs.map(([id,label,ic])=>`<button class="settingsNavBtn ${activeSettingsTab===id?'active':''}" onclick="settingsTab('${id}')">${ico(ic,id==='school'?'#0f766e':'#52637a')}<span>${label}</span></button>`).join('')}
function openSettings(){settingsModal.classList.add('show');settingsTab(activeSettingsTab||'school')} function closeSettings(){settingsModal.classList.remove('show')} function settingsTab(tab){if(tab==='slots')tab='school';activeSettingsTab=tab;renderSettingsNav();if(tab==='school')return schoolSettings();if(tab==='schoolyear')return schoolYearSettings();if(tab==='teachers')return teacherSettings();if(tab==='subjects')return settingsList('subjects');if(tab==='sections')return sectionSettings();if(tab==='advisers')return adviserSettings()}

function schoolYearSettings(){let years=availableSchoolYears(),target=currentSchoolYearName(),sourceOptions=years.filter(y=>y!==target).map(y=>`<option value="${esc(y)}">${esc(y)}</option>`).join(''),history=(state.migrationHistory||[]).filter(h=>h.targetSchoolYear===target&&h.active!==false).sort((a,b)=>String(b.migratedAt).localeCompare(String(a.migratedAt)));settingsContent.innerHTML=`<div class="settingsSectionHead"><div class="settingsSectionTitle"><h3>School Year & Migration</h3><p>Save schedules by school year and migrate selected levels without overwriting other migrated levels.</p></div></div><div class="settingsCard"><div class="syGrid"><label class="settingsField"><span>Active School Year</span><input id="syActiveInput" class="input" value="${esc(target)}" placeholder="e.g. 2026-2027"></label><label class="settingsField"><span>Switch to Available SY</span><select id="sySwitchSelect" class="input">${years.map(y=>`<option value="${esc(y)}" ${y===target?'selected':''}>${esc(y)}</option>`).join('')}</select></label></div><div class="syActions" style="margin-top:12px"><button class="btn primary" onclick="switchSchoolYear(syActiveInput.value)">Create / Load School Year</button><button class="btn" onclick="switchSchoolYear(sySwitchSelect.value)">Switch to Selected</button></div></div><div class="settingsCard"><div class="settingsSectionTitle"><h3>Migrate Schedule</h3><p>Same level migration replaces that level only. Other migrated levels are preserved.</p></div><div class="syGrid" style="margin-top:14px"><label class="settingsField"><span>Migrate From SY</span><select id="migSourceYear" class="input">${sourceOptions||'<option value="">No other school year available</option>'}</select></label><label class="settingsField"><span>Level</span><select id="migLevel" class="input"><option>All Levels</option><option>Elementary</option><option>JHS</option><option>SHS</option></select></label></div><div class="note migrationDanger" style="margin-top:12px">If the selected level was migrated before, only that migrated level will be replaced. Different migrated levels will remain intact.</div><div class="syActions" style="margin-top:12px"><button class="btn primary" onclick="migrateScheduleFromSchoolYear()">Migrate Schedule</button></div></div><div class="settingsCard"><div class="settingsSectionTitle"><h3>Migration History for ${esc(target)}</h3><p>Shows active migrated levels saved under this school year.</p></div><div class="migrationHistory">${history.length?history.map(h=>`<div class="migrationHistoryItem"><div><span class="migrationBadge">${esc(h.level)}</span></div><b>From ${esc(h.sourceSchoolYear)} to ${esc(h.targetSchoolYear)}</b><div class="migrationNote">Migrated: ${esc(new Date(h.migratedAt).toLocaleString())}</div></div>`).join(''):'<div class="muted">No migration history for this school year yet.</div>'}</div></div>`}

function teacherSettings(){let rows=loads();settingsContent.innerHTML=`<div class="settingsSectionHead"><div class="settingsSectionTitle"><h3>Teachers</h3><p>Add and update teacher profiles used in class programs.</p></div><button class="btn primary" onclick="openTeacherModal()">${ico('plus','#fff')} Add Teacher</button></div><div class="teacherSettingsList">${state.teachers.length?state.teachers.map(t=>{let c=teacherColor(t),load=rows.find(r=>r.teacher.id===t.id)||{blocks:0,minutes:0,adviserMinutes:0};return `<div class="teacherProfileCard"><div class="teacherProfileAvatar" style="background:${c}">${initials(t.name)}</div><div><div class="teacherProfileName">${esc(t.name)}</div><div class="teacherProfileMeta"><span class="teacherProfilePill">Teaching Position: ${esc(t.position||'No teaching position set')}</span><span class="teacherProfilePill">Room: ${esc(t.room||'Not set')}</span></div><div class="teacherProfileLoad">${load.blocks} scheduled subjects${load.adviserMinutes?` + ${load.adviserMinutes} adviser min`:''} • ${(load.minutes/60).toFixed(1)} hrs</div></div><div class="teacherProfileActions"><button class="btn" onclick="editTeacherProfile('${t.id}')">Edit</button><button class="btn danger" onclick="deleteResource('teachers','${t.id}')">Delete</button></div></div>`}).join(''):`<div class="empty">No teachers yet. Click <b>Add Teacher</b> to create a teacher profile.</div>`}</div>`}

function subjectActionIcon(type){return type==='delete'?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6M14 11v6"></path></svg>`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`}
function subjectTags(s){return Array.isArray(s.tags)?s.tags.filter(t=>['Kinder','ES','JHS','SHS'].includes(t)):[]}
function subjectTagPills(s){let tags=subjectTags(s);return tags.length?`<div class="subjectTagRow">${tags.map(t=>`<span class="subjectTag ${esc(t)}">${esc(t)}</span>`).join('')}</div>`:'<div class="muted">Visible in all levels</div>'}
function openSubjectModal(id=''){editSubjectId=id;let s=state.subjects.find(x=>x.id===id)||{name:'',tags:[]};subjectModalTitle.textContent=id?'Edit Subject':'Add Subject';subjectNameModalInput.value=s.name||'';['Kinder','ES','JHS','SHS'].forEach(tag=>{let el=document.getElementById('subjectModalTag_'+tag);if(el)el.checked=(s.tags||[]).includes(tag)});subjectModal.classList.add('show')}
function closeSubjectModal(){subjectModal.classList.remove('show');editSubjectId=null}
function saveSubjectModal(){let name=(subjectNameModalInput.value||'').trim();if(!name){toastMsg('Enter a subject name.');return}let duplicate=state.subjects.find(s=>s.id!==editSubjectId&&String(s.name||'').trim().toLowerCase()===name.toLowerCase());if(duplicate){toastMsg('Subject already exists.');return}let tags=['Kinder','ES','JHS','SHS'].filter(tag=>document.getElementById('subjectModalTag_'+tag)?.checked),rec={id:editSubjectId||uid('s'),name,tags};state.defaultSubjectsInitialized=true;if(editSubjectId)state.subjects=state.subjects.map(s=>s.id===editSubjectId?rec:s);else state.subjects.unshift(rec);closeSubjectModal();save();settingsTab('subjects');toastMsg('Subject saved.')}
function saveSubjectCard(id){let s=state.subjects.find(x=>x.id===id);if(!s)return;let tags=['Kinder','ES','JHS','SHS'].filter(tag=>document.getElementById(`subjectTag_${id}_${tag}`)?.checked);s.tags=tags;state.defaultSubjectsInitialized=true;save();settingsTab('subjects');toastMsg('Subject tags saved.')}
function settingsList(type){if(type==='teachers')return teacherSettings();if(type==='subjects'){settingsContent.innerHTML=`<div class="settingsSectionHead"><div class="settingsSectionTitle"><h3>Subjects</h3><p>Subject tags are shown as read-only pills. Open the pencil icon to edit subject name or level tags.</p></div><button class="btn primary" onclick="openSubjectModal()">${ico('plus','#fff')} Add Subject</button></div><div class="subjectCardGrid">${state.subjects.map(s=>`<div class="subjectCard"><div class="subjectCardHead"><div><div class="subjectCardTitle">${esc(s.name)}</div>${subjectTagPills(s)}</div><div class="subjectIconActions"><button class="iconBtn edit" title="Edit subject" onclick="openSubjectModal('${s.id}')">${subjectActionIcon('edit')}</button><button class="iconBtn delete" title="Delete subject" onclick="deleteResource('subjects','${s.id}')">${subjectActionIcon('delete')}</button></div></div></div>`).join('')||`<div class="empty">No subjects yet.</div>`}</div>`;return}settingsContent.innerHTML=''}
let selectedTeacherColor = '#64748b';

function renderTeacherColorChoices(selectedColor = '') {
  selectedTeacherColor = selectedColor || palette[0];
  const container = document.getElementById('teacherColorChoices');
  if (!container) return;
  
  let html = palette.map(color => {
    const isSelected = (color.toLowerCase() === selectedTeacherColor.toLowerCase());
    return `<button type="button" class="colorCircle ${isSelected ? 'selected' : ''}" style="background:${color}" onclick="selectTeacherColor('${color}')" title="${color}"></button>`;
  }).join('');
  
  html += `
    <div class="customColorInputWrap">
      <input type="color" id="teacherCustomColorInput" value="${selectedTeacherColor}" onchange="selectTeacherColor(this.value)" title="Choose custom color">
      <input type="text" id="teacherCustomColorText" value="${selectedTeacherColor}" oninput="selectTeacherColor(this.value)" placeholder="#hex" class="input customColorTextInput">
    </div>
  `;
  container.innerHTML = html;
  
  if (typeof teacherAvatarPreview !== 'undefined' && teacherAvatarPreview) {
    teacherAvatarPreview.style.background = selectedTeacherColor;
  }
}

function selectTeacherColor(color) {
  if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
    selectedTeacherColor = color;
    document.querySelectorAll('.colorCircle').forEach(btn => {
      const btnColor = btn.getAttribute('title') || '';
      btn.classList.toggle('selected', btnColor.toLowerCase() === color.toLowerCase());
    });
    const picker = document.getElementById('teacherCustomColorInput');
    const text = document.getElementById('teacherCustomColorText');
    if (picker) picker.value = color;
    if (text && document.activeElement !== text) text.value = color;
    if (typeof teacherAvatarPreview !== 'undefined' && teacherAvatarPreview) {
      teacherAvatarPreview.style.background = color;
    }
  }
}

function openTeacherModal(id=''){
  editTeacherId=id;
  let t=state.teachers.find(x=>x.id===id)||{name:'',position:'',room:'',color:palette[state.teachers.length%palette.length]};
  teacherModalTitle.textContent=id?'Edit Teacher':'Add Teacher';
  teacherNameInput.value=t.name||'';
  teacherPositionInput.value=t.position||'';
  teacherRoomInput.value=t.room||'';
  teacherSpecializationsInput.value=(t.specializations||[]).join(', ');
  let history=(t.subjectsTaught||[]);
  teacherHistoryDisplay.innerHTML=history.length?history.map(s=>`<span style="display:inline-block; padding:2px 6px; background:var(--accent); color:#fff; border-radius:4px; font-size:11px; margin-right:4px; margin-bottom:4px">${esc(s)}</span>`).join(''):'No history yet. Subjects will appear here automatically when assigned.';
  renderTeacherColorChoices(t.color || palette[0]);
  updateTeacherAvatarPreview();
  teacherModal.classList.add('show');
}
function editTeacherProfile(id){openTeacherModal(id)}
function closeTeacherModal(){teacherModal.classList.remove('show');editTeacherId=null}
function updateTeacherAvatarPreview(){let name=(teacherNameInput?.value||'').trim();teacherAvatarPreview.textContent=name?initials(name):'--'}
function saveTeacherProfile(){
  let name=(teacherNameInput.value||'').trim(),position=(teacherPositionInput.value||'').trim(),room=(teacherRoomInput.value||'').trim(),specs=(teacherSpecializationsInput.value||'').split(',').map(s=>s.trim()).filter(Boolean);
  if(!name){toastMsg('Teacher name is required.');teacherNameInput.focus();return}
  if(!position){toastMsg('Teaching Position is required.');teacherPositionInput.focus();return}
  if(editTeacherId){
    let t=state.teachers.find(x=>x.id===editTeacherId);
    if(t){
      t.name=name;
      t.position=position;
      t.room=room;
      t.specializations=specs;
      t.color=selectedTeacherColor;
    }
  } else {
    state.teachers.push({id:uid('t'),name,position,room,specializations:specs,subjectsTaught:[],color:selectedTeacherColor});
  }
  closeTeacherModal();
  save();
  settingsTab('teachers');
}
function addResource(type){if(type==='teachers')return openTeacherModal();if(type==='subjects')return openSubjectModal();} function deleteResource(type,id){askConfirm('Delete record','This will remove the record. Existing scheduled subjects may lose references.',()=>{if(type==='subjects')state.defaultSubjectsInitialized=true;state[type]=state[type].filter(x=>x.id!==id);save();settingsTab(type)})}

function nextSectionNameForGrade(grade){let used=state.sections.filter(s=>s.grade===grade).map(s=>String(s.name||'').trim().toUpperCase());for(let i=0;i<26;i++){let n=String.fromCharCode(65+i);if(!used.includes(n))return n}return 'New Section'}
function sectionExists(grade,name,id=''){let key=String(name||'').trim().toLowerCase();return state.sections.some(s=>s.id!==id&&s.grade===grade&&String(s.name||'').trim().toLowerCase()===key)}
function addSectionRecord(grade,name){grade=grade||state.grades[0]||'Grade 1';name=String(name||'').trim();if(!name){toastMsg('Enter a section name.');return null}if(sectionExists(grade,name)){toastMsg(`${grade} - ${name} already exists.`);return null}let rec={id:uid('sec'),grade,name};state.sections.push(rec);state.sections.sort((a,b)=>programGradeSort(a.grade,b.grade)||String(a.name||'').localeCompare(String(b.name||'')));return rec}
function addSectionSetting(){let rec=addSectionRecord(sectionGradeInput.value,sectionNameInput.value);if(rec){save();settingsTab('sections');toastMsg('Section added.')}}
function saveSectionSetting(id){let s=state.sections.find(x=>x.id===id);if(!s)return;let grade=document.getElementById('sectionGrade_'+id)?.value||s.grade,name=(document.getElementById('sectionName_'+id)?.value||s.name).trim();if(!name){toastMsg('Section name is required.');return}if(sectionExists(grade,name,id)){toastMsg(`${grade} - ${name} already exists.`);return}s.grade=grade;s.name=name;save();settingsTab('sections');toastMsg('Section saved.')}
function deleteSectionSetting(id){let s=state.sections.find(x=>x.id===id);if(!s)return;askConfirm('Delete section',`Delete ${s.grade} - ${s.name}? Existing class programs will remove this section reference. Scheduled subjects in this section will be cleared from the section field.`,()=>{state.sections=state.sections.filter(x=>x.id!==id);if(state.sectionAdvisers)delete state.sectionAdvisers[id];state.programs=(state.programs||[]).map(p=>({...p,sectionIds:(p.sectionIds||[]).filter(sid=>sid!==id)}));state.classes=(state.classes||[]).map(c=>c.sectionId===id?{...c,sectionId:''}:c);save();settingsTab('sections');toastMsg('Section deleted.')})}
function addSectionFromProgramModal(grade){let val=(quickSectionName?.value||'').trim();let rec=addSectionRecord(grade,val);if(rec){let checked=[...pSections.querySelectorAll('input:checked')].map(i=>i.value);checked.push(rec.id);let existing={sectionIds:checked};updateProgramForm(existing);toastMsg('Section added. Select it before saving the program.')}}
function sectionSettings(){let grouped=state.grades.map(g=>({grade:g,sections:state.sections.filter(s=>s.grade===g).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')))}));settingsContent.innerHTML=`<div class="settingsSectionHead"><div class="settingsSectionTitle"><h3>Sections</h3><p>Create class sections first, then assign advisers in Settings → Advisers and select sections in Class Programs.</p></div></div><div class="sectionAddPanel"><label class="settingsField"><span>Grade Level</span><select id="sectionGradeInput" class="input">${state.grades.map(g=>`<option>${esc(g)}</option>`).join('')}</select></label><label class="settingsField"><span>Section Name</span><input id="sectionNameInput" class="input" placeholder="e.g. A, B, Mabini"></label><button class="btn primary" onclick="addSectionSetting()">Add Section</button></div><div class="adviserWorkflow">Recommended workflow: <b>1)</b> Add sections here. <b>2)</b> Assign advisers in Advisers. <b>3)</b> Create a Class Program and select the sections to include.</div>${grouped.map(g=>`<div class="sectionGradeGroup"><div class="sectionGradeHeader"><b>${esc(g.grade)}</b><button class="btn" onclick="sectionGradeInput.value='${esc(g.grade)}';sectionNameInput.value='${esc(nextSectionNameForGrade(g.grade))}';sectionNameInput.focus()">+ Add to ${esc(g.grade)}</button></div><div class="sectionRows">${g.sections.length?g.sections.map(s=>`<div class="sectionRow"><div class="sectionRowLabel">${esc(s.grade)} - ${esc(s.name)}</div><select id="sectionGrade_${s.id}" class="input">${state.grades.map(gr=>`<option ${gr===s.grade?'selected':''}>${esc(gr)}</option>`).join('')}</select><input id="sectionName_${s.id}" class="input" value="${esc(s.name)}"><div style="display:flex;gap:8px"><button class="btn primary" onclick="saveSectionSetting('${s.id}')">Save</button><button class="btn danger" onclick="deleteSectionSetting('${s.id}')">Delete</button></div></div>`).join(''):'<div class="emptySmall">No sections yet. Use Add Section above.</div>'}</div></div>`).join('')}`}
function schoolSettings(){let sc=state.schoolConfig,fields=[['schoolName','School Name'],['schoolYear','School Year'],['division','Division'],['region','Region'],['district','District'],['schoolAddress','School Address'],['signatory1Name','Prepared by'],['signatory1Title','Prepared by Title'],['signatory2Name','Approved by'],['signatory2Title','Approved by Title']];settingsContent.innerHTML=`<div class="settingsSectionHead"><div class="settingsSectionTitle"><h3>School Profile</h3><p>Basic information printed or displayed in the class program. Click Save to record changes under the active school year.</p></div></div><div class="settingsCard"><div class="logoUploadCard"><div id="schoolLogoPreview" class="logoPreview">${sc.logoDataUrl?`<img src="${esc(sc.logoDataUrl)}" alt="School logo preview">`:`<span class="logoPreviewFallback">OES</span>`}</div><div class="logoUploadInfo"><h4>School Logo</h4><p>Upload the official school logo. The logo will appear in the top navigation bar and is saved with the active school profile.</p><div class="logoUploadActions"><input id="schoolLogoInput" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="display:none" onchange="handleSchoolLogoUpload(this)"><button class="btn" onclick="triggerSchoolLogoUpload()">${ico('upload','#0f766e')}Upload Logo</button><button class="btn" onclick="removeSchoolLogo()">${ico('refresh','#f59e0b')}Use Default</button></div></div></div><div class="settingsFormGrid">${fields.map(([k,l])=>`<label class="settingsField"><span>${l}</span><input id="schoolField_${k}" class="input" value="${esc(sc[k]||'')}"></label>`).join('')}</div><div class="schoolProfileHint">The School Year field is linked to the active School Year. Saving with a new school year stores the current schedule under that school year.</div><div class="schoolProfileSaveBar"><button class="btn primary" onclick="saveSchoolProfileSettings()">Save School Profile</button></div></div>`;renderSchoolLogoPreview()}
function renderSchoolLogo(){if(typeof schoolLogoMark==='undefined'||!schoolLogoMark)return;let data=state.schoolConfig&&state.schoolConfig.logoDataUrl;if(data)schoolLogoMark.innerHTML=`<img src="${esc(data)}" alt="">`;else schoolLogoMark.innerHTML='<span>OES</span>'}
function renderSchoolLogoPreview(){let el=document.getElementById('schoolLogoPreview');if(!el)return;let data=state.schoolConfig&&state.schoolConfig.logoDataUrl;el.innerHTML=data?`<img src="${esc(data)}" alt="School logo preview">`:'<span class="logoPreviewFallback">OES</span>'}
function triggerSchoolLogoUpload(){let input=document.getElementById('schoolLogoInput');if(input)input.click()}
function handleSchoolLogoUpload(input){let file=input&&input.files&&input.files[0];if(!file)return;if(!/^image\//.test(file.type)){toastMsg('Please upload an image file.');input.value='';return}if(file.size>1500000){toastMsg('Logo is too large. Please use an image below 1.5 MB.');input.value='';return}let reader=new FileReader();reader.onload=e=>{state.schoolConfig=state.schoolConfig||{};state.schoolConfig.logoDataUrl=e.target.result;syncActiveSchoolYear();localStorage.setItem(STORE,JSON.stringify(state));renderSchoolLogo();renderSchoolLogoPreview();toastMsg('School logo uploaded.');};reader.readAsDataURL(file)}
function removeSchoolLogo(){state.schoolConfig=state.schoolConfig||{};delete state.schoolConfig.logoDataUrl;syncActiveSchoolYear();localStorage.setItem(STORE,JSON.stringify(state));renderSchoolLogo();renderSchoolLogoPreview();toastMsg('Default school logo restored.')}
function saveSchoolProfileSettings(){let fields=['schoolName','schoolYear','division','region','district','schoolAddress','signatory1Name','signatory1Title','signatory2Name','signatory2Title'],oldSy=currentSchoolYearName();state.schoolConfig=state.schoolConfig||{};fields.forEach(k=>{let el=document.getElementById('schoolField_'+k);if(el)state.schoolConfig[k]=el.value});let newSy=(state.schoolConfig.schoolYear||oldSy||'Current School Year').trim()||'Current School Year';if(newSy!==oldSy){syncActiveSchoolYear();state.activeSchoolYear=newSy;state.schoolConfig.schoolYear=newSy;state.schoolYears=state.schoolYears||{};state.schoolYears[newSy]=yearSnapshotFrom(state)}else syncActiveSchoolYear();localStorage.setItem(STORE,JSON.stringify(state));toastMsg('School profile saved.');render();settingsTab('school')}
function slotSettings(){activeSettingsTab='school';return schoolSettings()}
function addProgramAdviser(pid){let p=state.programs.find(x=>x.id===pid);if(!p)return;p.advisers=p.advisers||[];if(isMultigradeProgram(p))p.advisers=[{id:uid('adv'),teacherId:'',name:'',title:'Multigrade Adviser'}];else p.advisers.push({id:uid('adv'),teacherId:'',name:'',title:'Adviser'});save();settingsTab('advisers')}
function setProgramAdviserTeacher(pid,aid,teacherId){let p=state.programs.find(x=>x.id===pid);if(!p)return;let a=(p.advisers||[]).find(x=>x.id===aid);if(!a)return;let t=state.teachers.find(x=>x.id===teacherId);a.teacherId=teacherId;a.name=t?t.name:'';save();settingsTab('advisers')}
function setMultigradeAdviser(pid,teacherId){let p=state.programs.find(x=>x.id===pid);if(!p)return;let t=state.teachers.find(x=>x.id===teacherId);p.advisers=[{id:(p.advisers&&p.advisers[0]?.id)||uid('adv'),teacherId:teacherId,name:t?t.name:'',title:'Multigrade Adviser'}];save();settingsTab('advisers')}
function teacherOptions(selected=''){return `<option value="">No adviser</option>${state.teachers.map(t=>`<option value="${t.id}" ${selected===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}`}
function deleteProgramAdviser(pid,aid){let p=state.programs.find(x=>x.id===pid);if(!p)return;p.advisers=(p.advisers||[]).filter(a=>a.id!==aid);save();settingsTab('advisers')}
function adviserSettings(){state.sectionAdvisers=state.sectionAdvisers||{};let gradeRows=state.grades.map(g=>{let secs=state.sections.filter(s=>s.grade===g).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));if(secs.length){return `<div class="adviserLiteGroup"><div class="adviserLiteGroupTitle"><span>${esc(g)}</span><span class="migrationBadge">${secs.length} section(s)</span></div>${secs.map(s=>`<div class="adviserLiteRow"><div class="adviserLiteLabel">${esc(s.grade)} - ${esc(s.name)}</div><select class="input" onchange="state.sectionAdvisers['${s.id}']=this.value;save();settingsTab('advisers')">${teacherOptions(state.sectionAdvisers[s.id]||'')}</select></div>`).join('')}</div>`}return `<div class="adviserLiteGroup"><div class="adviserLiteGroupTitle"><span>${esc(g)}</span><span class="migrationBadge">No sections</span></div><div class="adviserLiteRow"><div class="adviserLiteLabel">Grade-level Adviser</div><select class="input" onchange="state.advisers['${esc(g)}']=this.value;save();settingsTab('advisers')">${teacherOptions(state.advisers[g]||'')}</select></div></div>`}).join('');let mg=sortedPrograms().filter(isMultigradeProgram);let mgRows=mg.length?mg.map(p=>{let a=(p.advisers||[])[0]||{},sel=a.teacherId||'';return `<div class="adviserLiteRow"><div class="adviserLiteLabel">${esc(p.name)}<div class="settingsMini">${esc((p.grades||[]).join(', '))} • one adviser only</div></div><select class="input" onchange="setMultigradeAdviser('${p.id}',this.value)">${teacherOptions(sel)}</select></div>`}).join(''):'<div class="emptySmall">No multigrade program yet.</div>';settingsContent.innerHTML=`<div class="settingsSectionHead"><div class="settingsSectionTitle"><h3>Advisers</h3><p>Assign advisers directly. If sections exist, adviser assignment is per section. If no sections exist, adviser assignment is per grade.</p></div><button class="btn" onclick="settingsTab('sections')">Manage Sections</button></div><div class="adviserWorkflow"><b>Use direct rows below.</b> To add sections, open <b>Settings → Sections</b> or use <b>+ Add Section</b> inside the Class Program modal.</div><div class="settingsCard"><div class="settingsSectionTitle"><h3 style="font-size:15px">Section / Grade Advisers</h3><p>Each row saves immediately when an adviser is selected.</p></div><div style="height:12px"></div><div class="adviserLiteList">${gradeRows}</div></div><div class="settingsCard"><div class="settingsSectionTitle"><h3 style="font-size:15px">Multigrade Program Advisers</h3><p>Each multigrade program has one adviser. Adviser load is counted once only.</p></div><div style="height:12px"></div><div class="adviserLiteGroup">${mgRows}</div></div>`}

function schoolYearCodeForBackup(){let sy=String(currentSchoolYearName()||state.schoolConfig?.schoolYear||'').match(/(\d{2})\D*(\d{2})\s*$/);if(sy)return `SY${sy[1]}${sy[2]}`;let years=String(currentSchoolYearName()||'').match(/(\d{4}).*?(\d{4})/);if(years)return `SY${years[1].slice(-2)}${years[2].slice(-2)}`;return 'SYUNKNOWN'}
function schoolCodeForBackup(){let raw=String(state.schoolConfig?.schoolCode||state.schoolConfig?.schoolName||'').trim();if(!raw)return 'SCHOOL';let words=raw.replace(/[^A-Za-z0-9\s]/g,' ').split(/\s+/).filter(Boolean),code=words.length>1?words.map(w=>w[0]).join(''):raw.slice(0,6);code=code.toUpperCase().replace(/[^A-Z0-9]/g,'');return code||'SCHOOL'}
function timestampForBackup(){let d=new Date(),pad=n=>String(n).padStart(2,'0');return `${pad(d.getMonth()+1)}${pad(d.getDate())}${String(d.getFullYear()).slice(-2)}-${pad(d.getHours())}-${pad(d.getMinutes())}`}
function nextBackupVersionForYear(syCode){state.backupVersions=state.backupVersions||{};state.backupVersions[syCode]=Number(state.backupVersions[syCode]||0)+1;return state.backupVersions[syCode]}
function backupFileName(){let sy=schoolYearCodeForBackup(),v=nextBackupVersionForYear(sy),stamp=timestampForBackup(),school=schoolCodeForBackup();return `CLASSPROG-v${v}-${sy}.${stamp}-${school}.json`}

function exportData(){let filename=backupFileName();syncActiveSchoolYear();localStorage.setItem(STORE,JSON.stringify(state));let blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();URL.revokeObjectURL(a.href);toastMsg('Backup exported: '+filename)} function importData(e){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{state=migrate(JSON.parse(r.result));toastMsg('Backup imported.');save()}catch(err){toastMsg('Invalid JSON backup file.')}};r.readAsText(f)} function toastMsg(m){toastHost.innerHTML=`<div class="toast">${esc(m)}</div>`;setTimeout(()=>toastHost.innerHTML='',2200)} function askConfirm(title,message,onContinue){pendingConfirm=onContinue;confirmTitle.textContent=title;confirmMessage.textContent=message;confirmModal.classList.add('show')} function closeConfirm(){pendingConfirm=null;confirmModal.classList.remove('show')} function runConfirm(){let fn=pendingConfirm;closeConfirm();if(typeof fn==='function')fn()}
function closeAllModals() {
  closeSlotModal();
  closeClassModal();
  closeResetModal();
  closeSettings();
  closeSubjectModal();
  closeTeacherModal();
  closeConfirm();
  if (typeof closeCombineModal === 'function') closeCombineModal();
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAllModals();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undo();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
    e.preventDefault();
    redo();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    exportData();
  }
  if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f')) && document.activeElement !== search) {
    if (typeof search !== 'undefined' && search) {
      e.preventDefault();
      search.focus();
      search.select();
    }
  }
});
render();
// --- Custom Select Dropdown Upgrade ---
function upgradeSelectsToCustomDropdowns() {
  document.querySelectorAll('select.input').forEach(sel => {
    if (sel.nextElementSibling?.classList.contains('customSelectWrap')) {
      let wrap = sel.nextElementSibling;
      let menu = wrap.querySelector('.customSelectMenu');
      let btn = wrap.querySelector('.customSelectBtn span');
      if (menu && btn && menu.children.length !== sel.options.length) {
         menu.innerHTML = '';
         Array.from(sel.options).forEach((opt, idx) => {
            let item = document.createElement('button');
            item.className = 'customSelectMenuItem';
            if (idx === sel.selectedIndex) item.classList.add('active');
            item.textContent = opt.text;
            item.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              sel.selectedIndex = idx;
              btn.textContent = opt.text;
              sel.dispatchEvent(new Event('change'));
              menu.classList.remove('show');
              wrap.classList.remove('active');
            };
            menu.appendChild(item);
         });
         btn.textContent = sel.options[sel.selectedIndex]?.text || '';
      }
      return;
    }
    
    sel.style.display = 'none';
    let wrap = document.createElement('div');
    wrap.className = 'customSelectWrap';
    
    let btn = document.createElement('button');
    btn.className = 'customSelectBtn';
    
    let getSelectedText = () => {
      let opt = sel.options[sel.selectedIndex];
      return opt ? opt.text : '';
    };
    
    btn.innerHTML = `<span>${esc(getSelectedText())}</span> <span class="customSelectArrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>`;
    
    let menu = document.createElement('div');
    menu.className = 'customSelectMenu';
    
    Array.from(sel.options).forEach((opt, idx) => {
      let item = document.createElement('button');
      item.className = 'customSelectMenuItem';
      if (idx === sel.selectedIndex) item.classList.add('active');
      item.textContent = opt.text;
      item.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        sel.selectedIndex = idx;
        btn.querySelector('span').textContent = opt.text;
        sel.dispatchEvent(new Event('change'));
        menu.classList.remove('show');
        wrap.classList.remove('active');
      };
      menu.appendChild(item);
    });
    
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.customSelectMenu.show').forEach(m => {
        if (m !== menu) {
           m.classList.remove('show');
           m.parentElement.classList.remove('active');
        }
      });
      let show = menu.classList.toggle('show');
      wrap.classList.toggle('active', show);
    };
    
    wrap.appendChild(btn);
    wrap.appendChild(menu);
    sel.parentNode.insertBefore(wrap, sel.nextSibling);
    
    sel.addEventListener('change', () => {
      btn.querySelector('span').textContent = getSelectedText();
      Array.from(menu.children).forEach((child, idx) => {
        child.classList.toggle('active', idx === sel.selectedIndex);
      });
    });
  });
}

document.addEventListener('click', e => {
  if (!e.target.closest('.customSelectWrap')) {
    document.querySelectorAll('.customSelectMenu.show').forEach(m => {
       m.classList.remove('show');
       m.parentElement.classList.remove('active');
    });
  }
});

const selectObserver = new MutationObserver((mutations) => {
  let shouldRun = false;
  for (let m of mutations) {
    if (m.type === 'childList' && m.addedNodes.length) {
       shouldRun = true;
       break;
    }
  }
  if (shouldRun) {
     setTimeout(upgradeSelectsToCustomDropdowns, 10);
  }
});
document.addEventListener('DOMContentLoaded', () => {
  selectObserver.observe(document.body, { childList: true, subtree: true });
  upgradeSelectsToCustomDropdowns();
});
setTimeout(() => {
  selectObserver.observe(document.body, { childList: true, subtree: true });
  upgradeSelectsToCustomDropdowns();
}, 200);
// --- End Custom Select ---

