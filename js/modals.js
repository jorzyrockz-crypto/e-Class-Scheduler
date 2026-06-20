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
      if(items.length===0)html+=`<button class="add" onclick="openClassModal('${ts.id}','${esc(col.grade)}','${esc(col.sectionId)}')">${ico('plus','currentColor')} Assign Subject</button>`;
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
      if(items.length===0)html+=`<button class="add" onclick="openClassModal('${ts.id}','${esc(gr)}')">${ico('plus','currentColor')} Assign Subject</button>`;
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
function getSubjectColor(name) { let n = (name || '').toLowerCase(); if (n.includes('english')) return '#3b82f6'; if (n.includes('filipino')) return '#06b6d4'; if (n.includes('math')) return '#10b981'; if (n.includes('science')) return '#8b5cf6'; if (n.includes('ap') || n.includes('araling panlipunan')) return '#f97316'; if (n.includes('mapeh')) return '#ec4899'; if (n.includes('esp') || n.includes('edukasyon sa pagpapakatao')) return '#eab308'; if (n.includes('homeroom')) return '#64748b'; return '#94a3b8'; }
function block(c,slotId,grade,sectionId=''){
  let sub=get(state.subjects,c.subjectId),tea=get(state.teachers,c.teacherId),ts=get(state.timeSlots,c.timeSlotId),tc=teacherColor(tea),sc=getSubjectColor(sub.name),muted=selectedTeacher&&selectedTeacher!==c.teacherId?'opacity:.25':'';
  let init=initials(tea.name)||'--';
  let roomLabel=c.room||tea.room?`Room: ${esc(c.room||tea.room)}`:'';
  let posLabel=tea.position?esc(tea.position):'';
  let items=[{label:'Add another subject',action:()=>openClassModal(slotId,grade,sectionId)},{label:'Edit class',action:()=>editClass(c.id)},{label:'Delete class',danger:true,action:()=>deleteClass(c.id)}];
  return `<div class="block" data-class-id="${c.id}" draggable="true" ondragstart="dragClass(event,'${c.id}')" style="--card-color:${sc};border-color:${sc};background:${rgba(sc,.07)} !important;${muted}">
    <div class="classHead">
      <div class="classSubject" style="color:${sc}; font-weight:700;">${esc(sub.name)}</div>
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
function classConflictPreview(){if(!mTeach.value||!mSlot.value)return null;let p=activeProgram(),sameTeacher=state.classes.filter(c=>c.id!==editId&&c.teacherId===mTeach.value&&c.timeSlotId===mSlot.value&&(c.day||'master')==='master');let conflict=sameTeacher.find(c=>!(p&&isMultigradeProgram(p)&&c.programId===p.id));if(conflict){let sub=get(state.subjects,conflict.subjectId).name;return `${esc(get(state.teachers,mTeach.value).name)} already has ${esc(sub)} in ${esc(conflict.grade)} at ${esc(slotLabel(mSlot.value))}.`}let duplicate=state.classes.find(c=>c.id!==editId&&c.grade===mGrade.value&&c.timeSlotId===mSlot.value&&(c.sectionId||'')===(mSec.value||''));if(duplicate){let sub=get(state.subjects,duplicate.subjectId).name;return `${esc(currentPositionText().split(' • ')[0])} (${esc(sectionLabel(mSec.value))}) is already scheduled for ${esc(sub)} at ${esc(slotLabel(mSlot.value))}.`}return null}
function updateClassNotice(){let problem=classConflictPreview();if(problem)showClassNotice('error',`<b>Possible conflict:</b> ${problem}`);else showClassNotice('info',`This subject will be added to <b>${esc(currentPositionText())}</b>.`)}
function refreshSectionOptions(grade,selected=''){let opts=['<option value="">No section</option>'].concat(state.sections.filter(s=>!grade||s.grade===grade).map(s=>`<option value="${s.id}" ${selected===s.id?'selected':''}>${esc(s.name)}</option>`));mSec.innerHTML=opts.join('')}
function populateModal(){refreshSubjectOptions(activeGrade,'');mTeach.innerHTML=state.teachers.length?state.teachers.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join(''):'<option value="">Add teachers first</option>';mGrade.innerHTML=state.grades.map(g=>`<option>${esc(g)}</option>`).join('');mSlot.innerHTML=state.timeSlots.length?state.timeSlots.map(ts=>`<option value="${ts.id}">${to12(ts.start)}–${to12(ts.end)} • ${ts.mins} min</option>`).join(''):'<option value="">Add time slots first</option>';refreshSectionOptions(mGrade.value||activeGrade,'')}
function bindClassModalEvents(){mSub.onchange=updateClassNotice;mTeach.onchange=updateClassNotice;mGrade.onchange=()=>{refreshSectionOptions(mGrade.value,mSec.value);refreshSubjectOptions(mGrade.value,mSub.value);updateClassNotice()};mSlot.onchange=updateClassNotice;mSec.onchange=updateClassNotice}
function openClassModal(slot='',grade='',sectionId='',teacherId=''){editId=null;modalTitle.textContent='Add Scheduled Subject';populateModal();let resolvedGrade=grade||activeGrade;mGrade.value=resolvedGrade;mSlot.value=slot||state.timeSlots.find(x=>x.type==='academic')?.id||'';refreshSectionOptions(resolvedGrade,sectionId||'');refreshSubjectOptions(resolvedGrade,'');mSec.value=sectionId||'';if(teacherId)mTeach.value=teacherId;let p=state.programs.find(x=>x.id===state.activeProgramId);mSec.disabled=!!(p&&p.type==='multigrade');bindClassModalEvents();updateClassNotice();classModal.classList.add('show')}
function editClass(id){let c=state.classes.find(x=>x.id===id);if(!c)return;editId=id;modalTitle.textContent='Edit Scheduled Subject';populateModal();mTeach.value=c.teacherId;mGrade.value=c.grade;refreshSectionOptions(c.grade,c.sectionId||'');refreshSubjectOptions(c.grade,c.subjectId);mSub.value=c.subjectId;mSlot.value=c.timeSlotId;mSec.value=c.sectionId||'';let p=state.programs.find(x=>x.id===state.activeProgramId);mSec.disabled=!!(p&&p.type==='multigrade');bindClassModalEvents();updateClassNotice();classModal.classList.add('show')}
function closeClassModal(){clearClassNotice();classModal.classList.remove('show')}
function saveClass(){if(!mSub.value||!mTeach.value||!mSlot.value){showClassNotice('error','Add at least one matching subject, teacher, and time slot first.');return}let problem=classConflictPreview();if(problem){showClassNotice('error',`<b>Cannot save yet:</b> ${problem}`);return}let p=state.programs.find(x=>x.id===state.activeProgramId);let existing=state.classes.find(x=>x.id===editId);let c={id:editId||uid('c'),subjectId:mSub.value,teacherId:mTeach.value,grade:mGrade.value,timeSlotId:mSlot.value,day:'master',sectionId:(p&&p.type==='multigrade')?'':mSec.value,programId:p?p.id:(existing?.programId||'')};if(editId)state.classes=state.classes.map(x=>x.id===editId?c:x);else state.classes.push(c);closeClassModal();save()}
function deleteClass(id){askConfirm('Delete scheduled subject','This removes the selected scheduled subject only.',()=>{state.classes=state.classes.filter(c=>c.id!==id);save()})}
function dragTeacher(e,id){dragTeacherId=id;dragId=null;e.dataTransfer.effectAllowed='copy';try{e.dataTransfer.setData('text/plain',id)}catch(err){}}
function dragClass(e,id){dragId=id;dragTeacherId=null;e.dataTransfer.effectAllowed='move'} function allowDrop(e){e.preventDefault();if(dragTeacherId)e.currentTarget.classList.add('teacherReady')} function leaveDrop(e){e.currentTarget.classList.remove('teacherReady')} function dropClass(e,slot,grade,sectionId=''){e.preventDefault();e.currentTarget.classList.remove('teacherReady');if(dragTeacherId){let teacherId=dragTeacherId;dragTeacherId=null;openClassModal(slot,grade,sectionId,teacherId);return}let c=state.classes.find(x=>x.id===dragId);if(c){let p=state.programs.find(x=>x.id===state.activeProgramId);c.timeSlotId=slot;c.grade=grade;c.sectionId=(p&&p.type==='multigrade')?'':(sectionId||c.sectionId||'');save()}} function applySearch(){let q=(search?.value||'').trim().toLowerCase();let targets=[];if(activeView==='dashboard'||(activeView==='scheduler'&&!activeProgram()))targets=[...document.querySelectorAll('.programCard')];else if(activeView==='scheduler'&&activeProgram())targets=[...document.querySelectorAll('.block')];else targets=[...document.querySelectorAll('.teacherProfileCard,.subjectCard,.sectionGradeGroup,.adviserLiteGroup')];targets.forEach(el=>{let hay=(el.dataset.search||el.innerText||'').toLowerCase();el.classList.toggle('searchHidden',!!q&&!hay.includes(q))})}
function openResetModal(){resetModal.classList.add('show')} function closeResetModal(){resetModal.classList.remove('show')} function confirmResetScheduleOnly(){askConfirm('Reset schedule only','This will clear all scheduled subjects from the schedule matrix. Teachers, subjects, school profile, sections, advisers, and custom time slots will remain.',()=>{state.classes=[];closeResetModal();toastMsg('Schedule cleared.');save()})} function confirmResetAllBlank(){askConfirm('Reset all to blank','This will clear all app data and return to a blank starter setup. Use Import Backup if you want to restore previous data.',()=>{state=migrate(JSON.parse(JSON.stringify(BLANK_STATE)));activeView='dashboard';state.schedulerExpanded=true;closeResetModal();toastMsg('App reset to blank.');save()})}
function renderSettingsNav(){let tabs=[['school','School Profile','settings'],['schoolyear','School Year & Migration','calendar'],['teachers','Teachers','users'],['subjects','Subjects','book'],['sections','Sections','book'],['advisers','Advisers','users']];settingsNav.innerHTML=tabs.map(([id,label,ic])=>`<button class="settingsNavBtn ${activeSettingsTab===id?'active':''}" onclick="settingsTab('${id}')">${ico(ic,id==='school'?'#0f766e':'#52637a')}<span>${label}</span></button>`).join('')}
function openSettings(){settingsModal.classList.add('show');settingsTab(activeSettingsTab||'school')} function closeSettings(){settingsModal.classList.remove('show')} function settingsTab(tab){if(tab==='slots')tab='school';activeSettingsTab=tab;renderSettingsNav();if(tab==='school')return schoolSettings();if(tab==='schoolyear')return schoolYearSettings();if(tab==='teachers')return teacherSettings();if(tab==='subjects')return settingsList('subjects');if(tab==='sections')return sectionSettings();if(tab==='advisers')return adviserSettings()}

function schoolYearSettings(){let years=availableSchoolYears(),target=currentSchoolYearName(),sourceOptions=years.filter(y=>y!==target).map(y=>`<option value="${esc(y)}">${esc(y)}</option>`).join(''),history=(state.migrationHistory||[]).filter(h=>h.targetSchoolYear===target&&h.active!==false).sort((a,b)=>String(b.migratedAt).localeCompare(String(a.migratedAt)));settingsContent.innerHTML=`<div class="settingsSectionHead"><div class="settingsSectionTitle"><h3>School Year & Migration</h3><p>Save schedules by school year and migrate selected levels without overwriting other migrated levels.</p></div></div><div class="settingsCard"><div class="syGrid"><label class="settingsField"><span>Active School Year</span><input id="syActiveInput" class="input" value="${esc(target)}" placeholder="e.g. 2026-2027"></label><label class="settingsField"><span>Switch to Available SY</span><select id="sySwitchSelect" class="input">${years.map(y=>`<option value="${esc(y)}" ${y===target?'selected':''}>${esc(y)}</option>`).join('')}</select></label></div><div class="syActions" style="margin-top:12px"><button class="btn primary" onclick="switchSchoolYear(syActiveInput.value)">Create / Load School Year</button><button class="btn" onclick="switchSchoolYear(sySwitchSelect.value)">Switch to Selected</button></div></div><div class="settingsCard"><div class="settingsSectionTitle"><h3>Migrate Schedule</h3><p>Same level migration replaces that level only. Other migrated levels are preserved.</p></div><div class="syGrid" style="margin-top:14px"><label class="settingsField"><span>Migrate From SY</span><select id="migSourceYear" class="input">${sourceOptions||'<option value="">No other school year available</option>'}</select></label><label class="settingsField"><span>Level</span><select id="migLevel" class="input"><option>All Levels</option><option>Elementary</option><option>JHS</option><option>SHS</option></select></label></div><div class="note migrationDanger" style="margin-top:12px">If the selected level was migrated before, only that migrated level will be replaced. Different migrated levels will remain intact.</div><div class="syActions" style="margin-top:12px"><button class="btn primary" onclick="migrateScheduleFromSchoolYear()">Migrate Schedule</button></div></div><div class="settingsCard"><div class="settingsSectionTitle"><h3>Migration History for ${esc(target)}</h3><p>Shows active migrated levels saved under this school year.</p></div><div class="migrationHistory">${history.length?history.map(h=>`<div class="migrationHistoryItem"><div><span class="migrationBadge">${esc(h.level)}</span></div><b>From ${esc(h.sourceSchoolYear)} to ${esc(h.targetSchoolYear)}</b><div class="migrationNote">Migrated: ${esc(new Date(h.migratedAt).toLocaleString())}</div></div>`).join(''):'<div class="muted">No migration history for this school year yet.</div>'}</div></div>`}

function teacherSettings(){let rows=loads();settingsContent.innerHTML=`<div class="settingsSectionHead"><div class="settingsSectionTitle"><h3>Teachers</h3><p>Add and update teacher profiles used in class programs.</p></div><button class="btn primary" onclick="openTeacherModal()">${ico('plus','#fff')} Add Teacher</button></div><div class="teacherSettingsList">${state.teachers.length?state.teachers.map(t=>{let c=teacherColor(t),load=rows.find(r=>r.teacher.id===t.id)||{blocks:0,minutes:0,adviserMinutes:0};return `<div class="teacherProfileCard"><div class="teacherProfileAvatar" style="background:${c}">${initials(t.name)}</div><div><div class="teacherProfileName">${esc(t.name)}</div><div class="teacherProfileMeta"><span class="teacherProfilePill">Teaching Position: ${esc(t.position||'No teaching position set')}</span><span class="teacherProfilePill">Room: ${esc(t.room||'Not set')}</span></div><div class="teacherProfileLoad">${load.blocks} scheduled subjects${load.adviserMinutes?` + ${load.adviserMinutes} adviser min`:''} • ${(load.minutes/60).toFixed(1)} hrs</div></div><div class="teacherProfileActions"><button class="btn" onclick="editTeacherProfile('${t.id}')">Edit</button><button class="btn danger" onclick="deleteResource('teachers','${t.id}')">Delete</button></div></div>`}).join(''):`<div class="emptyState">${ico('users')}<h3>No teachers added</h3><p>Start by adding your teaching staff.</p><button class="btn primary" onclick="openTeacherModal()">Add Teacher</button></div>`}</div>`}

function subjectActionIcon(type){return type==='delete'?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6M14 11v6"></path></svg>`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`}
function subjectTags(s){return Array.isArray(s.tags)?s.tags.filter(t=>['Kinder','ES','JHS','SHS'].includes(t)):[]}
function subjectTagPills(s){let tags=subjectTags(s);return tags.length?`<div class="subjectTagRow">${tags.map(t=>`<span class="subjectTag ${esc(t)}">${esc(t)}</span>`).join('')}</div>`:'<div class="muted">Visible in all levels</div>'}
function openSubjectModal(id=''){editSubjectId=id;let s=state.subjects.find(x=>x.id===id)||{name:'',tags:[]};subjectModalTitle.textContent=id?'Edit Subject':'Add Subject';subjectNameModalInput.value=s.name||'';['Kinder','ES','JHS','SHS'].forEach(tag=>{let el=document.getElementById('subjectModalTag_'+tag);if(el)el.checked=(s.tags||[]).includes(tag)});subjectModal.classList.add('show')}
function closeSubjectModal(){subjectModal.classList.remove('show');editSubjectId=null}
function saveSubjectModal(){let name=(subjectNameModalInput.value||'').trim();if(!name){toastMsg('Enter a subject name.');return}let duplicate=state.subjects.find(s=>s.id!==editSubjectId&&String(s.name||'').trim().toLowerCase()===name.toLowerCase());if(duplicate){toastMsg('Subject already exists.');return}let tags=['Kinder','ES','JHS','SHS'].filter(tag=>document.getElementById('subjectModalTag_'+tag)?.checked),rec={id:editSubjectId||uid('s'),name,tags};state.defaultSubjectsInitialized=true;if(editSubjectId)state.subjects=state.subjects.map(s=>s.id===editSubjectId?rec:s);else state.subjects.unshift(rec);closeSubjectModal();save();settingsTab('subjects');toastMsg('Subject saved.')}
function saveSubjectCard(id){let s=state.subjects.find(x=>x.id===id);if(!s)return;let tags=['Kinder','ES','JHS','SHS'].filter(tag=>document.getElementById(`subjectTag_${id}_${tag}`)?.checked);s.tags=tags;state.defaultSubjectsInitialized=true;save();settingsTab('subjects');toastMsg('Subject tags saved.')}
function settingsList(type){if(type==='teachers')return teacherSettings();if(type==='subjects'){settingsContent.innerHTML=`<div class="settingsSectionHead"><div class="settingsSectionTitle"><h3>Subjects</h3><p>Subject tags are shown as read-only pills. Open the pencil icon to edit subject name or level tags.</p></div><button class="btn primary" onclick="openSubjectModal()">${ico('plus','#fff')} Add Subject</button></div><div class="subjectCardGrid">${state.subjects.map(s=>`<div class="subjectCard"><div class="subjectCardHead"><div><div class="subjectCardTitle">${esc(s.name)}</div>${subjectTagPills(s)}</div><div class="subjectIconActions"><button class="iconBtn edit" title="Edit subject" onclick="openSubjectModal('${s.id}')">${subjectActionIcon('edit')}</button><button class="iconBtn delete" title="Delete subject" onclick="deleteResource('subjects','${s.id}')">${subjectActionIcon('delete')}</button></div></div></div>`).join('')||`<div class="emptyState">${ico('book')}<h3>No subjects found</h3><p>Subjects are required to build class programs.</p><button class="btn primary" onclick="openSubjectModal()">Add Subject</button></div>`}</div>`;return}settingsContent.innerHTML=''}
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
  renderTeacherColorChoices(t.color || palette[0]);
  updateTeacherAvatarPreview();
  teacherModal.classList.add('show');
}
function editTeacherProfile(id){openTeacherModal(id)}
function closeTeacherModal(){teacherModal.classList.remove('show');editTeacherId=null}
function updateTeacherAvatarPreview(){let name=(teacherNameInput?.value||'').trim();teacherAvatarPreview.textContent=name?initials(name):'--'}
function saveTeacherProfile(){
  let name=(teacherNameInput.value||'').trim(),position=(teacherPositionInput.value||'').trim(),room=(teacherRoomInput.value||'').trim();
  if(!name){toastMsg('Teacher name is required.');teacherNameInput.focus();return}
  if(!position){toastMsg('Teaching Position is required.');teacherPositionInput.focus();return}
  if(editTeacherId){
    let t=state.teachers.find(x=>x.id===editTeacherId);
    if(t){
      t.name=name;
      t.position=position;
      t.room=room;
      t.color=selectedTeacherColor;
    }
  } else {
    state.teachers.push({id:uid('t'),name,position,room,color:selectedTeacherColor});
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

