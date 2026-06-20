function render(){hideContextMenu();menuRegistry={};menuCounter=0;renderHead();renderNav();renderSchedulerRail();renderMetrics();renderFaculty();renderDiag();populateModal();renderContent();applyLayoutMode();hydrateStaticIcons();renderThemeIcon();applySearch();updateUndoRedoButtons();} function applyLayoutMode(){let g=document.querySelector('.grid');g?.classList.toggle('full',activeView!=='scheduler'||!state.activeProgramId);g?.classList.toggle('dashboardView',activeView==='dashboard');g?.classList.toggle('analyticsView',activeView==='analytics');g?.classList.toggle('schedulerView',activeView==='scheduler');document.querySelector('.kpis')?.classList.toggle('hideForAnalytics',activeView==='analytics' || activeView==='dashboard' || activeView==='scheduler');document.querySelector('.shell')?.classList.toggle('schedulerRailMode',activeView==='scheduler');let rail=document.getElementById('schedulerRail');rail?.classList.toggle('visible',activeView==='scheduler');rail?.classList.toggle('collapsed',activeView==='scheduler'&&!!state.schedulerRailCollapsed);document.querySelector('.shell')?.classList.toggle('schedulerRailCollapsed',activeView==='scheduler'&&!!state.schedulerRailCollapsed)} function formatSchoolYearLabel(sy){sy=String(sy||'').trim();if(!sy)return 'No school year set';return /^S\.?Y\.?/i.test(sy)?sy:'S.Y. '+sy}
function toggleSchoolYearDropdown(e){e.stopPropagation();let wrap=document.getElementById('topSchoolYearDropdown'),menu=document.getElementById('topSchoolYearMenu');if(wrap&&menu){let show=menu.classList.toggle('show');wrap.classList.toggle('active',show)}}
function renderTopSchoolYearDropdown(){let menu=document.getElementById('topSchoolYearMenu'),label=document.getElementById('topSchoolYearLabel');if(!menu||!label)return;let years=availableSchoolYears(),current=currentSchoolYearName();if(!years.includes(current))years.unshift(current);label.textContent=formatSchoolYearLabel(current);let html=years.map(y=>`<button class="topSyMenuItem ${y===current?'active':''}" onclick="handleTopSchoolYearChange('${esc(y)}')">${esc(formatSchoolYearLabel(y))}</button>`).join('');html+=`<button class="topSyMenuItem addMenuBtn" onclick="handleTopSchoolYearChange('__add_new_sy__')">＋ Add New School Year</button>`;menu.innerHTML=html}
function handleTopSchoolYearChange(value){let wrap=document.getElementById('topSchoolYearDropdown'),menu=document.getElementById('topSchoolYearMenu');if(wrap&&menu){menu.classList.remove('show');wrap.classList.remove('active')}if(value==='__add_new_sy__'){let sy=prompt('Enter new school year, e.g. 2027–2028');if(!sy){renderTopSchoolYearDropdown();return}switchSchoolYear(sy.trim());return}switchSchoolYear(value)}
function renderHead(){let sc=state.schoolConfig;let title=(sc.schoolName||'Your School Name').toUpperCase();let sy=sc.schoolYear||state.activeSchoolYear||currentSchoolYearName();schoolName.textContent=title;let divPart=sc.division||'Division';let distPart=sc.district||'District';schoolMeta.textContent=`${divPart} • ${distPart} • ${formatSchoolYearLabel(sy)}`;renderSchoolLogo();renderTopSchoolYearDropdown()} function programBadge(type){return type==='multigrade'?'MG':type==='multi_section'?'SEC':type==='kindergarten'?'K':''}

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
function renderNav(){let activeScheduler=activeView==='scheduler';nav.innerHTML=`<button class="nav ${activeView==='dashboard'?'active':''}" onclick="openDashboard()" title="Dashboard">${ico('chart','currentColor')}<span>Dashboard</span></button><button class="nav ${activeScheduler?'active':''}" onclick="openSchedulerHome()" title="Class Scheduler">${ico('calendar','currentColor')}<span>Class Scheduler</span></button><button class="nav ${activeView==='summary'?'active':''}" onclick="openSummaryView()" title="Summary">${ico('chart','currentColor')}<span>Summary</span></button><button class="nav ${activeView==='analytics'?'active':''}" onclick="goAnalytics()" title="Time Check">${ico('clock','currentColor')}<span>Time Check</span></button>`}
function activeProgram(){return state.programs.find(p=>p.id===state.activeProgramId)||null}
function scopedClasses(){let p=activeView==='scheduler'?activeProgram():null;return activeView==='scheduler'?(p?state.classes.filter(c=>classBelongsToProgram(c,p)):[]):state.classes}
function adviserGradeLabel(grade){let secs=state.sections.filter(s=>s.grade===grade);if(!secs.length)return grade;return secs.map(s=>`${grade} - ${s.name}`).join(', ')}
function gradeLevelTag(grade){let g=String(grade||'').toLowerCase();if(g.includes('kindergarten'))return 'K';let m=g.match(/grade\s*(\d+)/i),n=m?Number(m[1]):0;if(n>=1&&n<=6)return 'ES';if(n>=7&&n<=10)return 'JHS';if(n>=11&&n<=12)return 'SHS';return ''}
function subjectAllowedForGrade(subject,grade){let tags=Array.isArray(subject.tags)?subject.tags:[];if(!tags.length)return true;let tag=gradeLevelTag(grade);if(tag==='K')tag='Kinder';return tags.includes(tag)}
function subjectAllowedForProgram(subject,p,grade=''){if(!p)return subjectAllowedForGrade(subject,grade||activeGrade);let grades=grade?[grade]:(p.grades||[]);return !(Array.isArray(subject.tags)&&subject.tags.length)||grades.some(g=>subjectAllowedForGrade(subject,g))}
function subjectOptionsForContext(grade='',selectedId=''){let p=activeProgram(),list=state.subjects.filter(s=>subjectAllowedForProgram(s,p,grade));if(selectedId&&!list.some(s=>s.id===selectedId)){let s=state.subjects.find(x=>x.id===selectedId);if(s)list.unshift(s)}return list}
function refreshSubjectOptions(grade='',selectedId=''){let list=subjectOptionsForContext(grade,selectedId);mSub.innerHTML=list.length?list.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join(''):'<option value="">No matching subject tags</option>';if(selectedId&&list.some(s=>s.id===selectedId))mSub.value=selectedId}
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
function diag(){let list=((activeView==='scheduler'&&activeProgram())?scopedClasses():state.classes).filter(classCountsTowardLoad),conflicts=[];if(state.teachers.length===0) conflicts.push({setupIssue:true,msg:'Setup Required: Encode Faculty Members',action:"openSettingsModal();settingsTab('teachers')"});if(state.subjects.length===0) conflicts.push({setupIssue:true,msg:'Setup Required: Build Subject Bank',action:"openSettingsModal();settingsTab('subjects')"});if((state.programs||[]).length===0) conflicts.push({setupIssue:true,msg:'Setup Required: Create Class Programs',action:"openProgramModal()"});let adviserCount=Object.values(state.advisers||{}).filter(Boolean).length+Object.values(state.sectionAdvisers||{}).filter(Boolean).length+(state.programs||[]).reduce((a,p)=>a+(p.advisers||[]).filter(x=>x.name).length,0);if(adviserCount===0 && state.teachers.length>0 && (state.programs||[]).length>0) conflicts.push({setupIssue:true,msg:'Setup Required: Assign Grade Advisers',action:"openSettingsModal();settingsTab('advisers')"});for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){let a=list[i],b=list[j];let teacherConflict=(a.teacherId&&a.teacherId===b.teacherId&&a.timeSlotId===b.timeSlotId&&(a.day||'master')===(b.day||'master'));let sectionConflict=(a.grade===b.grade&&(a.sectionId||'')===(b.sectionId||'')&&a.timeSlotId===b.timeSlotId&&(a.day||'master')===(b.day||'master'));if(teacherConflict||sectionConflict){let pa=state.programs.find(p=>p.id===a.programId),pb=state.programs.find(p=>p.id===b.programId);if(teacherConflict&&!sectionConflict&&pa&&pb&&pa.id===pb.id&&isMultigradeProgram(pa))continue;let ts=get(state.timeSlots,a.timeSlotId),tea=get(state.teachers,a.teacherId),sa=get(state.subjects,a.subjectId),sb=get(state.subjects,b.subjectId);conflicts.push({a,b,teacher:tea.name,time:`${to12(ts.start)}–${to12(ts.end)}`,slot:ts,subjectA:sa.name,subjectB:sb.name,gradeA:a.grade,gradeB:b.grade,sectionA:a.sectionId?get(state.sections,a.sectionId).name:'',sectionB:b.sectionId?get(state.sections,b.sectionId).name:'',day:(a.day||'master'),type:sectionConflict?'section':'teacher'})}}return{conflicts}}
function renderMetrics(){
  let d=diag();
  let overall=overallTimeCompliance();
  let compScore=overall.score;
  let confSub=d.conflicts.length ? d.conflicts.length + ' need review' : 'Perfect!';
  let data=[
    {cls:'subjects',label:'Total Sections',value:(state.sections||[]).length,icon:'grid',color:'#3b82f6',sub:'Across grades'},
    {cls:'teachers',label:'Total Teachers',value:(state.teachers||[]).length,icon:'users',color:'#0f766e',sub:'Faculty count'},
    {cls:'scheduled',label:'Subjects Assigned',value:(state.classes||[]).length,icon:'calendar',color:'#8b5cf6',sub:'Total schedule blocks'},
    {cls:'avgload',label:'Completion Rate',value:compScore+'%',icon:'flag',color:'#f59e0b',sub:'Time allotment'},
    {cls:'conflicts',label:'Conflicts',value:d.conflicts.length,icon:'alert',color:'#ef4444',sub:confSub}
  ];
  metrics.innerHTML=data.map(x=>'<div class="card metric '+x.cls+'"><div class="metricIcon">'+ico(x.icon,x.color)+'</div><div class="metricVal">'+x.value+'</div><div class="metricLab">'+x.label+'</div><div class="metricSub">'+x.sub+'</div></div>').join('');
}
function renderFaculty(){faculty.innerHTML=loads().length?loads().sort((a,b)=>b.minutes-a.minutes).map(x=>{let c=teacherColor(x.teacher),pos=x.teacher.position?esc(x.teacher.position):'No teaching position set',room=x.teacher.room?` • Room: ${esc(x.teacher.room)}`:'',st=loadStatus(x.minutes);let pill=`<button type="button" class="workloadStatusPill status-${st.kind}" onclick="event.stopPropagation();openSummaryForStatus('${st.kind}')" title="Open Teaching Load Summary filtered by ${st.label}">${st.label}</button>`;return`<div class="teacher ${selectedTeacher===x.teacher.id?'active':''}" data-status="${st.kind}" draggable="true" ondragstart="dragTeacher(event,'${x.teacher.id}')" onclick="selectedTeacher='${x.teacher.id}';render()" title="Drag this teacher to an empty schedule cell to add a scheduled subject"><div class="avatar" style="background:${c}">${initials(x.teacher.name)}</div><div style="min-width:0"><div class="teacherTop"><div class="teacherName">${esc(x.teacher.name)}</div><button class="btn teacherEditBtn" onclick="event.stopPropagation();editTeacherProfile('${x.teacher.id}')" title="Edit teacher profile">Edit</button></div><div class="teacherMeta"><span class="dot" style="background:${c}"></span>${pos}${room}</div><div class="teacherStatusRow">${pill}</div></div></div>`}).join(''):'<div class="emptyState">'+ico('users')+'<h3>No teachers added</h3><p>Start by adding your teaching staff.</p><button class="btn primary" onclick="openSettingsModal();settingsTab(\'teachers\');openTeacherModal()">Add Teacher</button></div>'}
function openSummaryForStatus(kind){summaryStatus=kind||'all';activeView='summary';state.activeTab='summary';save()}
function clearTeacher(){selectedTeacher='';search.value='';render()} function renderDiag(){let d=diag();let issues=d.conflicts;if(issues.length){let msg=issues.some(c=>c.setupIssue)?`${issues.length} setup issue(s) and conflict(s) detected.`:`${issues.length} conflict(s) detected.`;diagnostics.innerHTML=`<div class="alert badbg"><b>${msg}</b><br>${issues.slice(0,4).map(conflictJumpButton).join('<br>')}</div>`}else{diagnostics.innerHTML=`<div class="alert ok">Schedule is healthy and ready.</div>`}}
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
function conflictLabel(c){if(c.setupIssue) return esc(c.msg);let secA=c.sectionA?` - ${c.sectionA}`:'',secB=c.sectionB?` - ${c.sectionB}`:'';if(c.type==='section')return `${esc(c.gradeA)}${esc(secA)} is double-booked at ${esc(c.time)}: ${esc(c.subjectA)} and ${esc(c.subjectB)}.`;return `${esc(c.teacher)} is assigned twice at ${esc(c.time)}: ${esc(c.subjectA)} (${esc(c.gradeA)}${esc(secA)}) and ${esc(c.subjectB)} (${esc(c.gradeB)}${esc(secB)}).`}
function conflictJumpButton(c){if(c.setupIssue) return `<button class="conflictJump setup" onclick="${c.action}" title="Click to resolve this setup requirement">${conflictLabel(c)}</button>`;return `<button class="conflictJump" onclick="highlightConflict('${c.a.id}','${c.b.id}')" title="Open and highlight this conflict">${conflictLabel(c)}</button>`}
function highlightConflict(aId,bId){let c=state.classes.find(x=>x.id===aId)||state.classes.find(x=>x.id===bId);if(c&&c.programId){state.activeProgramId=c.programId;state.schedulerExpanded=true;activeView='scheduler';state.activeTab='scheduler';selectedTeacher=c.teacherId||selectedTeacher;localStorage.setItem(STORE,JSON.stringify(state));render()}setTimeout(()=>{[aId,bId].forEach(id=>{let el=document.querySelector(`.block[data-class-id="${id}"]`);if(el){el.classList.add('conflictFocus');el.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});setTimeout(()=>el.classList.remove('conflictFocus'),2600)}})},120)}
function inlineDiagnostics(){let d=diag();if(!d.conflicts.length)return `<div class="alert ok inlineDiag"><div class="diagTitle">No schedule double-booking detected.</div></div>`;let shown=d.conflicts.slice(0,3).map(c=>`<li>${conflictJumpButton(c)}</li>`).join(''),more=d.conflicts.length>3?`<li>${d.conflicts.length-3} more conflict(s). Use Teacher Workload or search by teacher name to review remaining entries.</li>`:'';return `<div class="alert badbg inlineDiag"><div class="diagTitle">${d.conflicts.length} conflict(s) detected.</div><ul class="diagDetails">${shown}${more}</ul><div class="diagHint">Guide: change the teacher, move one scheduled subject to another time slot, or remove the duplicate scheduled subject.</div></div>`}
function programAdviserLine(p){let lines=programAdviserDetails(p);return lines.length?'Adviser(s): '+lines.join('; '):''}
function dashboardProgramClass(p){if(p.type==='kindergarten'||(p.grades||[]).includes('Kindergarten'))return 'kindergarten';if((p.grades||[]).some(g=>['Grade 1','Grade 2'].includes(g)))return 'g12';return 'g36'}
function dashboardProgramArt(cls){return `<div class="progArt ${cls==='kindergarten'?'artStar':cls==='g12'?'artBook':'artTrophy'}"></div>`}
function programAdviserCompact(p){let lines=programAdviserDetails(p),count=lines.length;if(!count)return 'No adviser assigned';return count===1?'1 adviser assigned':`${count} advisers assigned`}
function programGradesDisplay(p){return (p.grades||[]).join(', ')||'No grades selected'}
function programCardHtml(p,mode='dashboard'){let cls=dashboardProgramClass(p),status=programStatusInfo(p),linked=state.classes.filter(c=>classBelongsToProgram(c,p)),teacherCount=new Set(linked.map(c=>c.teacherId).filter(Boolean)).size,advLines=programAdviserDetails(p),advCompact=programAdviserCompact(p),menuId='prog-card-'+p.id;if(mode==='scheduler'){menuRegistry[menuId]=[{label:'Open',action:()=>openProgram(p.id)},{label:'Edit',action:()=>editProgram(p.id)},{label:'Split Classes',action:()=>splitProgramClasses(p.id)},{label:'Combine Classes',action:()=>openCombineProgramModal(p.id)},{label:p.countsTowardLoad===false?'Count in Teaching Load':'Set as Display Only',action:()=>toggleProgramLoad(p.id)},{label:'Delete',danger:true,action:()=>deleteProgram(p.id)}]}let actions=mode==='scheduler'?`<button class="btn primary" onclick="openProgram('${p.id}')">Open</button><button class="btn" onclick="editProgram('${p.id}')">Edit</button><button class="btn programMoreBtn" onclick="event.stopPropagation();toggleContextMenu(event,'${menuId}')">...</button>`:`<button class="btn primary" onclick="openProgram('${p.id}')">Open</button><button class="btn" onclick="editProgram('${p.id}')">Edit</button>`;return `<div class="programCard ${cls}" data-search="${esc((p.name+' '+programTypeLabel(p.type)+' '+programGradesDisplay(p)+' '+advLines.join(' ')).toLowerCase())}"><span class="programStatusPill programStatus-${status.kind}">${status.label}</span><div class="programType">${programTypeLabel(p.type)}</div><div class="programName">${esc(p.name)}</div><div class="programMeta compact"><div class="programMetaLine">Grades: ${esc(programGradesDisplay(p))}</div><div class="programAdviserCompact" title="${esc(advLines.join('\n')||'No adviser assigned')}">Advisers: ${esc(advCompact)}</div></div><div class="programStats"><span class="programMiniStat">${ico('calendar','#344054')} ${linked.length} scheduled</span><span class="programMiniStat">${ico('users','#344054')} ${teacherCount} teacher(s)</span>${programLoadBadge(p)}</div><div class="programTip">${esc(status.tip)}</div>${dashboardProgramArt(cls)}<div class="programActions">${actions}</div></div>`}
function programStatusInfo(p){let linked=state.classes.filter(c=>classBelongsToProgram(c,p)),conf=diag().conflicts.some(x=>classBelongsToProgram(x.a,p)||classBelongsToProgram(x.b,p));if(conf)return{kind:'conflict',label:'Conflict',tip:'Needs schedule review'};if(!linked.length)return{kind:'empty',label:'Empty',tip:'No scheduled subjects yet'};let teacherCount=new Set(linked.map(c=>c.teacherId).filter(Boolean)).size;if(teacherCount&&linked.length>=Math.max(1,(p.grades||[]).length*3))return{kind:'ready',label:'Ready',tip:'Has scheduled subjects and assigned teachers'};return{kind:'progress',label:'In Progress',tip:'Continue assigning subjects and teachers'}}
function setupStatusInfo(d){let hasTeachers=state.teachers.length>0,hasSubjects=state.subjects.length>0,hasPrograms=(state.programs||[]).length>0,hasScheduled=state.classes.length>0,hasAdviser=Object.values(state.advisers||{}).some(Boolean)||Object.values(state.sectionAdvisers||{}).some(Boolean)||(state.programs||[]).some(p=>(p.advisers||[]).some(a=>a.name));if(d.conflicts.length)return{kind:'review-needed',label:'Review Needed',icon:'⚠',title:'Schedule conflict detected.',message:'Review schedule conflicts before printing or finalizing.',action:'Review Scheduler',onclick:'openSchedulerHome()'};if(!hasTeachers)return{kind:'setup-needed',label:'Setup Needed',icon:'!',title:'Next step: Add teachers.',message:'Teachers are required before scheduled subjects can be assigned.',action:'Add Teachers',onclick:"openSettings();settingsTab('teachers')"};if(!hasSubjects)return{kind:'setup-needed',label:'Setup Needed',icon:'!',title:'Next step: Add subjects.',message:'Subjects are required before building class schedules.',action:'Add Subjects',onclick:"openSettings();settingsTab('subjects')"};if(!hasPrograms)return{kind:'setup-needed',label:'Setup Needed',icon:'!',title:'Next step: Create a class program.',message:'Create at least one class program to begin scheduling.',action:'Add Class Program',onclick:'openProgramModal()'};if(!hasScheduled)return{kind:'setup-needed',label:'Setup Needed',icon:'!',title:'Next step: Add scheduled subjects.',message:'Open a class program and start assigning subjects to time blocks.',action:'Open Scheduler',onclick:'openSchedulerHome()'};if(!hasAdviser)return{kind:'setup-needed',label:'Setup Needed',icon:'!',title:'Recommended: Assign advisers.',message:'Adviser assignments improve teaching load reporting and class program completeness.',action:'Assign Advisers',onclick:"openSettings();settingsTab('advisers')"};return{kind:'all-good',label:'All Good!',icon:'✓',title:'No double-booking detected.',message:'Great job! Your schedule is conflict-free and setup looks complete.',action:'View Scheduler',onclick:'openSchedulerHome()'}}
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
  
  let healthLabel = analyticsStatusText(score);
  
  let metrics = [
    { cls: 'teachers', label: 'Teachers', value: state.teachers.length, sub: 'Faculty encodes', icon: 'users', color: '#0f766e', onclick: "openSettings(); settingsTab('teachers')" },
    { cls: 'subjects', label: 'Subjects', value: state.subjects.length, sub: 'Subject bank catalog', icon: 'book', color: '#3b82f6', onclick: "openSettings(); settingsTab('subjects')" },
    { cls: 'programs', label: 'Class Programs', value: (state.programs||[]).length, sub: 'Schedule groupings', icon: 'grid', color: '#eab308', onclick: "openProgramModal()" },
    { cls: 'scheduled', label: 'Scheduled Classes', value: state.classes.length, sub: 'Blocks encoded', icon: 'calendar', color: '#8b5cf6', onclick: "openSchedulerHome()" },
    { cls: 'health ' + (hasIssues ? 'has-issues' : ''), label: 'Completion Score', value: score + '%', sub: healthLabel, icon: 'chart', color: hasIssues ? '#ef4444' : '#10b981', onclick: "openAnalyticsView()" }
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
    ${cards ? `<div class="db-programs-grid">${cards}</div>` : `<div class="emptyState">${ico('calendar')}<h3>No schedules generated</h3><p>Generate your first class schedule.</p><button class="btn primary" onclick="openProgramModal()">Generate Schedule</button></div>`}
  </div>`;
}

function dashboardConflictsHtml(){
  let d=diag(), conflicts=d.conflicts;
  let data=analyticsData();
  
  let body='';
  if (conflicts.length > 0) {
    let list = conflicts.slice(0, 4);
    body = `<div class="db-conflict-list">
      ${list.map(c => c.setupIssue ? `
        <div class="db-conflict-item" onclick="${c.action}" style="border-color:var(--warning-border); background:var(--warning-bg);">
          <div class="db-conflict-title-row" style="color:var(--warning-text);">
            ${ico('alert', 'var(--warning)')}
            <span>Setup Required</span>
          </div>
          <div class="db-conflict-desc" style="color:var(--warning-text);">
            ${esc(c.msg)}
          </div>
          <div class="db-conflict-jump-hint" style="color:var(--warning-text);">Click to complete setup &rarr;</div>
        </div>
      ` : `
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
      ${conflicts.length > 4 ? `<div style="text-align:center; font-size:11.5px; color:var(--text-muted); font-weight:700;">+ ${conflicts.length - 4} more issue(s) detected.</div>` : ''}
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
      ${conflicts.length > 0 ? `<span class="statusPill status-bad">${conflicts.length} issue(s)</span>` : `<span class="statusPill status-good">Healthy</span>`}
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
  let allLoads = loads();
  let list = allLoads.filter(l => loadStatus(l.minutes).kind === 'overload').sort((a,b)=>String(a.teacher.name||'').localeCompare(String(b.teacher.name||'')));
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
    if (allLoads.length > 0) {
      body = `<div class="db-ongoing-empty">Great! No teachers currently have overload issues.</div>`;
    } else {
      body = `<div class="db-ongoing-empty">No teachers encoded yet. Go to Settings to add.</div>`;
    }
  }

  return `<div class="db-card">
    <div class="db-card-header">
      <div class="db-card-title">${ico('users', 'var(--accent)')}<span>Teacher Overload Issues</span></div>
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

