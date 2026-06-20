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

function resizeImage(dataUrl, maxMB, callback) {
  const maxBytes = maxMB * 1024 * 1024;
  const parts = dataUrl.split(',');
  if (parts.length < 2) return callback(dataUrl);
  let byteString = atob(parts[1]);
  if (byteString.length <= maxBytes) return callback(dataUrl);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;
    
    const maxDim = 1200;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.9;
    let newDataUrl = canvas.toDataURL('image/jpeg', quality);

    while (atob(newDataUrl.split(',')[1]).length > maxBytes && quality > 0.4) {
      quality -= 0.1;
      newDataUrl = canvas.toDataURL('image/jpeg', quality);
    }
    
    callback(newDataUrl);
  };
  img.src = dataUrl;
}
