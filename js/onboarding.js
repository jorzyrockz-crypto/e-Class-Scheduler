/* ====================================================
   ONBOARDING WIZARD — js/onboarding.js
   ==================================================== */

(function () {
  /* ── Constants ─────────────────────────────────── */
  const SCHOOL_TYPES = [
    { key: 'Kinder',      label: 'Kindergarten',         iconId: 'baby', iconColor: '#16a34a', desc: 'Kindergarten only',         grades: ['Kindergarten'] },
    { key: 'Elementary',  label: 'Elementary',            iconId: 'book', iconColor: '#3b82f6', desc: 'Kinder + Grades 1–6',       grades: ['Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6'] },
    { key: 'Secondary',   label: 'Secondary / JHS',       iconId: 'users', iconColor: '#8b5cf6', desc: 'Grades 7–10',               grades: ['Grade 7','Grade 8','Grade 9','Grade 10'] },
    { key: 'Integrated',  label: 'Integrated',            iconId: 'home', iconColor: '#0f766e', desc: 'All levels: Kinder–G10',   grades: ['Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10'] },
  ];

  const ALL_GRADES = ['Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10'];

  const OB_SUBJECTS_KINDER = ['MEETING TIME I', 'CIRCLE TIME I', 'QUIET / NAP TIME', 'CIRCLE TIME II', 'INDOOR / OUTDOOR PLAY', 'WRAP-UP TIME'];
  const OB_SUBJECTS_ES = ['LANGUAGE', 'READING AND LITERACY', 'FILIPINO', 'ENGLISH', 'MATHEMATICS', 'SCIENCE', 'ARALING PANLIPUNAN', 'EPP / TLE', 'MAPEH', 'GMRC', 'MAKABANSA', 'HOMEROOM GUIDANCE', 'ARAL PROGRAM'];
  const OB_SUBJECTS_JHS = ['FILIPINO', 'ENGLISH', 'MATHEMATICS', 'SCIENCE', 'ARALING PANLIPUNAN', 'TLE', 'MAPEH', 'HOMEROOM GUIDANCE', 'AP', 'HGP', 'ARAL PROGRAM'];
  const OB_GRADES_ES = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6'];
  const OB_GRADES_JHS = ['Grade 7','Grade 8','Grade 9','Grade 10'];

  /* Grade short labels for chips */
  function gradeShort(g) {
    if (g === 'Kindergarten') return 'Kinder';
    const m = g.match(/Grade\s*(\d+)/i);
    return m ? 'G' + m[1] : g;
  }

  /* ── Session Buffers ────────────────────────────── */
  // _obStep     – current step number (1–6)
  // _obDir      – 'fwd' | 'bck'
  // _obTypes    – string[] selected school type keys
  // _obGrades   – string[] active grades (from step 3)
  // _obSections – { [grade]: string } section names
  // _obSubjects – { name, grades[] }[]
  // _obTeachers – { name, position, levels[], subjectNames[] }[]
  window._ob = {
    step: 1,
    dir: 'fwd',
    types: [],
    grades: [],
    sections: {},
    subjects: [],
    teachers: [],
  };

  /* ── Grade union from types ─────────────────────── */
  function gradesForTypes(types) {
    if (!types || types.length === 0) return ALL_GRADES;
    const set = new Set();
    SCHOOL_TYPES.filter(t => types.includes(t.key)).forEach(t => t.grades.forEach(g => set.add(g)));
    // Keep canonical order
    return ALL_GRADES.filter(g => set.has(g));
  }

  /* ── Should run? ────────────────────────────────── */
  function shouldRun() {
    if (typeof state === 'undefined') return false;
    // Show the wizard whenever onboardingComplete is not explicitly true.
    // This ensures a refresh mid-wizard still shows the wizard.
    return state.onboardingComplete !== true;
  }

  /* ── Public entry point ─────────────────────────── */
  window.initOnboarding = function () {
    if (!shouldRun()) return;
    const el = document.getElementById('onboardingWizard');
    if (!el) return;
    el.classList.remove('hidden');
    renderStep(1, 'fwd');
  };

  // Expose renderStep for rerunOnboarding()
  window._obRenderStep = function(n, dir) { renderStep(n, dir || 'fwd'); };

  /* Close */
  window.closeOnboarding = function () {
    const el = document.getElementById('onboardingWizard');
    if (el) el.classList.add('hidden');
  };

  /* ── Navigate ────────────────────────────────────── */
  window.obNext = function () {
    const s = window._ob;
    if (!validateStep(s.step)) return;
    collectStep(s.step);
    if (s.step >= 5) {
      completeOnboarding();
      return;
    }
    renderStep(s.step + 1, 'fwd');
  };

  window.obBack = function () {
    const s = window._ob;
    if (s.step <= 1) return;
    collectStep(s.step);
    renderStep(s.step - 1, 'bck');
  };

  window.obSkip = function () {
    const s = window._ob;
    if (s.step >= 5) { completeOnboarding(); return; }
    renderStep(s.step + 1, 'fwd');
  };

  window.obGotoStep = function (targetStep) {
    const s = window._ob;
    if (targetStep === s.step) return;
    
    // Validate if going forward. Optionally, only allow going back or going to immediate next step.
    // For a free-navigation wizard, we validate the current step.
    if (targetStep > s.step) {
      if (!validateStep(s.step)) return;
    }
    
    collectStep(s.step);
    renderStep(targetStep, targetStep > s.step ? 'fwd' : 'bck');
  };

  /* ── Validate step ──────────────────────────────── */
  function validateStep(n) {
    const msg = document.getElementById('obValidMsg');
    const show = (txt) => { if (msg) { msg.textContent = txt; setTimeout(() => { if (msg) msg.textContent = ''; }, 3000); } };

    if (n === 2) {
      const name = document.getElementById('obSchoolName');
      if (name && !name.value.trim()) { show('Please enter your school name.'); name.focus(); return false; }
      if (window._ob.types.length === 0) { show('Please select at least one school type.'); return false; }
    }
    return true;
  }

  /* ── Collect current step data ──────────────────── */
  function collectStep(n) {
    const ob = window._ob;
    if (n === 2) {
      // collect types from checkboxes (already live-updated via obTypeToggle)
      ob.schoolName     = val('obSchoolName');
      ob.division       = val('obDivision');
      ob.district       = val('obDistrict');
      ob.schoolYear     = val('obSchoolYear');
      ob.address        = val('obAddress');
    }
    if (n === 3) {
      ob.grades = [];
      ob.sections = {};
      document.querySelectorAll('.obGradeRow').forEach(row => {
        const cb  = row.querySelector('input[type="checkbox"]');
        const inp = row.querySelector('.obSectionInput');
        if (cb && cb.checked) {
          const g = cb.dataset.grade;
          ob.grades.push(g);
          if (inp && inp.value.trim()) ob.sections[g] = inp.value.trim();
        }
      });
    }
    if (n === 4) {
      ob.subjects = [];
      // Collect from Kinder tiles
      document.querySelectorAll('.obSubjectTile.selected').forEach(tile => {
        ob.subjects.push({ name: tile.dataset.name, grades: ['Kindergarten'] });
      });
      // Collect from Matrices
      document.querySelectorAll('.obSubjectMatrix tr.active').forEach(row => {
        const name = row.dataset.name;
        if (!name) return;
        const grades = [...row.querySelectorAll('input[type="checkbox"]:checked')].map(c => c.dataset.grade);
        if (grades.length > 0) ob.subjects.push({ name, grades });
      });
      // Collect from custom rows
      document.querySelectorAll('.obSubjectRow').forEach(row => {
        const nameEl = row.querySelector('.obSubjectNameInput');
        if (!nameEl || !nameEl.value.trim()) return;
        const name = nameEl.value.trim().toUpperCase();
        const grades = [...row.querySelectorAll('.obGradeChip input:checked')].map(c => c.dataset.grade);
        ob.subjects.push({ name, grades });
      });
    }
    if (n === 5) {
      if (typeof window.obSaveTeacherForm === 'function') window.obSaveTeacherForm(true);
    }
  }

  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  /* ── School type toggle ─────────────────────────── */
  window.obTypeToggle = function (key, isChecked) {
    const ob = window._ob;
    if (typeof isChecked === 'boolean') {
      if (isChecked && !ob.types.includes(key)) ob.types.push(key);
      else if (!isChecked) ob.types = ob.types.filter(k => k !== key);
    } else {
      // fallback toggle
      const idx = ob.types.indexOf(key);
      if (idx >= 0) ob.types.splice(idx, 1);
      else ob.types.push(key);
    }
    // sync chip UI
    document.querySelectorAll('.obSchoolTypeChip').forEach(chip => {
      const active = ob.types.includes(chip.dataset.type);
      chip.classList.toggle('selected', active);
      const cb = chip.querySelector('input[type="checkbox"]');
      if (cb) cb.checked = active;
    });
  };

  /* ── Grade row toggle ───────────────────────────── */
  window.obGradeToggle = function (el) {
    const row = el.closest('.obGradeRow');
    if (row) row.classList.toggle('checked', el.checked);
    const inp = row && row.querySelector('.obSectionInput');
    if (inp) inp.disabled = !el.checked;
  };

  /* ── Grade chip toggle ──────────────────────────── */
  window.obChipToggle = function (el) {
    const chip = el.closest('.obGradeChip') || el.closest('.obSubjectTaughtChip') || el.closest('.obLevelTag');
    if (chip) chip.classList.toggle('checked', el.checked);
  };

  /* ── Subject Matrix & Tile Helpers ──────────────── */
  window.obToggleKinderTile = function (el) {
    el.classList.toggle('selected');
  };

  window.obToggleMatrixRow = function (tdEl) {
    const row = tdEl.closest('tr');
    if (!row) return;
    const cbs = row.querySelectorAll('input[type="checkbox"]');
    // If all are checked, uncheck all. Otherwise check all.
    const allChecked = Array.from(cbs).every(cb => cb.checked);
    cbs.forEach(cb => cb.checked = !allChecked);
    row.classList.toggle('active', !allChecked);
  };

  window.obMatrixCheckChange = function (cb) {
    const row = cb.closest('tr');
    if (!row) return;
    const anyChecked = row.querySelector('input[type="checkbox"]:checked') !== null;
    row.classList.toggle('active', anyChecked);
  };

  window.obSelectAllSection = function (sectionId) {
    document.querySelectorAll(`#${sectionId} input[type="checkbox"]`).forEach(cb => {
      cb.checked = true;
      obMatrixCheckChange(cb);
    });
  };

  window.obClearSection = function (sectionId) {
    document.querySelectorAll(`#${sectionId} input[type="checkbox"]`).forEach(cb => {
      cb.checked = false;
      obMatrixCheckChange(cb);
    });
  };

  /* ── Subject rows ───────────────────────────────── */
  window.obAddSubject = function () {
    const list = document.getElementById('obSubjectList');
    if (!list) return;
    const grades = window._ob.grades.length > 0 ? window._ob.grades : gradesForTypes(window._ob.types);
    const idx = list.querySelectorAll('.obSubjectRow').length;
    const row = document.createElement('div');
    row.className = 'obSubjectRow';
    row.innerHTML = `
      <div class="obSubjectRowTop">
        <input class="obSubjectNameInput" placeholder="e.g. Mathematics" maxlength="80">
        <button class="obRemoveBtn" onclick="this.closest('.obSubjectRow').remove()" title="Remove">×</button>
      </div>
      <div class="obGradeChips">
        ${grades.map(g => `
          <label class="obGradeChip" title="${g}">
            <input type="checkbox" data-grade="${g}" onchange="obChipToggle(this)">
            ${gradeShort(g)}
          </label>`).join('')}
      </div>`;
    list.appendChild(row);
    row.querySelector('.obSubjectNameInput').focus();
  };


  /* ── Teacher Split Layout Actions ───────────────── */
  window._ob.editingTeacherIndex = -1;

  window.obSaveTeacherForm = function (silent = false) {
    const ob = window._ob;
    const nameEl = document.getElementById('obTFormName');
    const posEl  = document.getElementById('obTFormPos');
    if (!nameEl) return;
    const name = nameEl.value.trim();
    if (!name) {
      if (!silent) alert('Enter a teacher name.');
      return;
    }
    const levels = [...document.querySelectorAll('#obTFormLevels input:checked')].map(c => c.dataset.level);
    const subjectNames = [...document.querySelectorAll('#obTFormSubjects input:checked')].map(c => c.dataset.subject);
    
    const rec = {
      name,
      position: posEl ? posEl.value.trim() : '',
      levels,
      subjectNames
    };

    if (ob.editingTeacherIndex >= 0) {
      ob.teachers[ob.editingTeacherIndex] = rec;
      ob.editingTeacherIndex = -1;
    } else {
      ob.teachers.push(rec);
    }

    if (!silent) {
      nameEl.value = '';
      if (posEl) posEl.value = '';
      document.querySelectorAll('#obTFormLevels input:checked, #obTFormSubjects input:checked').forEach(cb => {
        cb.checked = false;
        obChipToggle(cb);
      });
      document.getElementById('obSaveTeacherBtn').textContent = 'Save Teacher';
      obRenderTeacherList();
    }
  };

  window.obEditTeacher = function (idx) {
    const ob = window._ob;
    const t = ob.teachers[idx];
    if (!t) return;
    ob.editingTeacherIndex = idx;
    
    document.getElementById('obTFormName').value = t.name;
    document.getElementById('obTFormPos').value = t.position || '';
    
    document.querySelectorAll('#obTFormLevels input').forEach(cb => {
      cb.checked = t.levels.includes(cb.dataset.level);
      obChipToggle(cb);
    });
    document.querySelectorAll('#obTFormSubjects input').forEach(cb => {
      cb.checked = t.subjectNames.includes(cb.dataset.subject);
      obChipToggle(cb);
    });
    
    document.getElementById('obSaveTeacherBtn').textContent = 'Update Teacher';
  };

  window.obDeleteTeacher = function (idx) {
    const ob = window._ob;
    ob.teachers.splice(idx, 1);
    if (ob.editingTeacherIndex === idx) {
      ob.editingTeacherIndex = -1;
      document.getElementById('obTFormName').value = '';
      document.getElementById('obTFormPos').value = '';
      document.querySelectorAll('#obTFormLevels input, #obTFormSubjects input').forEach(cb => {
        cb.checked = false;
        obChipToggle(cb);
      });
      document.getElementById('obSaveTeacherBtn').textContent = 'Save Teacher';
    } else if (ob.editingTeacherIndex > idx) {
      ob.editingTeacherIndex--;
    }
    obRenderTeacherList();
  };

  window.obRenderTeacherList = function () {
    const ob = window._ob;
    const container = document.getElementById('obTeacherListRender');
    if (!container) return;
    
    container.innerHTML = ob.teachers.length === 0 
      ? '<div class="obSubjectsTaughtEmpty">No teachers added yet. Fill out the form to add one.</div>'
      : ob.teachers.map((t, idx) => `
          <div class="obMiniTeacherCard">
            <div class="obMiniTeacherInfo">
              <div class="obMiniTeacherAvatar">${String(t.name||'').split(/\s+/).filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
              <div class="obMiniTeacherText">
                <div class="obMiniTeacherName">${escHtml(t.name)}</div>
              </div>
            </div>
            <div class="obMiniTeacherActions">
              <button class="obMiniActionBtn" onclick="obEditTeacher(${idx})">Edit</button>
              <button class="obMiniActionBtn danger" onclick="obDeleteTeacher(${idx})">Delete</button>
            </div>
          </div>
        `).join('');
    
    const countEl = document.getElementById('obTeacherCount');
    if (countEl) countEl.textContent = ob.teachers.length;
  };

  /* ── Render a step ──────────────────────────────── */
  function renderStep(n, dir) {
    const ob = window._ob;
    ob.step = n;
    ob.dir = dir;

    // Progress bar
    const prog = document.getElementById('obProgressBar');
    if (prog) {
      prog.innerHTML = [
        { n: 1, label: 'Welcome'  },
        { n: 2, label: 'School'   },
        { n: 3, label: 'Grades'   },
        { n: 4, label: 'Subjects' },
        { n: 5, label: 'Teachers' },
      ].map(s => `
        <div class="obProgressStep ${n > s.n ? 'done' : n === s.n ? 'active' : ''}" onclick="window.obGotoStep(${s.n})">
          <div class="obStepDot"><span>${s.n}</span></div>
          <div class="obStepLabel">${s.label}</div>
        </div>`).join('');
    }

    // Body
    const body = document.getElementById('obBody');
    if (!body) return;
    body.innerHTML = `<div class="obStep ${dir === 'bck' ? 'reverse' : ''}">${buildStep(n)}</div>`;
    body.scrollTop = 0;

    // Footer
    const footer = document.getElementById('obFooter');
    if (footer) footer.innerHTML = buildFooter(n);

    // Validation msg container
    const vm = document.getElementById('obValidMsg');
    // already rendered in footer

    // Post-render: restore saved values
    restoreStep(n);
  }

  /* ── Build step HTML ────────────────────────────── */
  function buildStep(n) {
    const ob = window._ob;
    if (n === 1) return buildStep1();
    if (n === 2) return buildStep2();
    if (n === 3) return buildStep3();
    if (n === 4) return buildStep4();
    if (n === 5) return buildStep5();
    return '';
  }

  window.obImportBackup = function (e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const loadedState = migrate(JSON.parse(r.result));
        state = loadedState; // Overwrite current state so classes/slots are kept

        const ob = window._ob;
        const sc = state.schoolConfig || {};
        
        // 1. School Config
        ob.schoolName = sc.schoolName || '';
        ob.address = sc.schoolAddress || '';
        ob.division = sc.division || '';
        ob.district = sc.district || '';
        ob.schoolYear = sc.schoolYear || '';
        ob.logoDataUrl = sc.logoDataUrl || '';
        ob.types = sc.schoolType || [];
        
        // 2. Grades
        ob.grades = [...(state.grades || [])];
        
        // 3. Sections
        ob.sections = {};
        (state.sections || []).forEach(sec => {
          if (ob.sections[sec.grade]) {
            ob.sections[sec.grade] += ', ' + sec.name;
          } else {
            ob.sections[sec.grade] = sec.name;
          }
        });
        
        // 4. Subjects
        ob.subjects = (state.subjects || []).map(s => {
          let grades = [];
          const tags = s.tags || [];
          if (tags.includes('Kinder')) grades.push('Kindergarten');
          if (tags.includes('ES')) {
            OB_GRADES_ES.forEach(g => { if (ob.grades.includes(g)) grades.push(g); });
          }
          if (tags.includes('JHS')) {
            OB_GRADES_JHS.forEach(g => { if (ob.grades.includes(g)) grades.push(g); });
          }
          return { name: s.name, grades };
        });
        
        // 5. Teachers
        ob.teachers = (state.teachers || []).map(t => {
          return {
            name: t.name,
            position: t.position || '',
            levels: t.schoolLevel || [],
            subjectNames: (t.subjectIds || []).map(id => {
              const subj = state.subjects.find(s => s.id === id);
              return subj ? subj.name : null;
            }).filter(Boolean)
          };
        });

        toastMsg('Backup loaded. Please review your setup.');
        _obRenderStep(2, 'fwd');
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    r.readAsText(f);
  };

  function buildStep1() {
    return `
      <div class="obWelcomeHero">
        <div class="obWelcomeBadge">CP</div>
        <div class="obWelcomeTitle">Welcome to Class Program Scheduler</div>
        <div class="obWelcomeSub">Let's set up your school in just a few minutes. We'll collect your school info, grade levels, subjects, and teachers so you're ready to build schedules right away.</div>
        <div class="obFeatures">
          <div class="obFeature">
            <div class="obFeatureIcon" style="background:#eff6ff">
              ${ico('calendar', '#3b82f6')}
            </div>
            <div class="obFeatureLabel">Smart Schedule Matrix</div>
          </div>
          <div class="obFeature">
            <div class="obFeatureIcon" style="background:#f0fdf4">
              ${ico('users', '#16a34a')}
            </div>
            <div class="obFeatureLabel">Teacher Load Tracking</div>
          </div>
          <div class="obFeature">
            <div class="obFeatureIcon" style="background:#faf5ff">
              ${ico('chart', '#8b5cf6')}
            </div>
            <div class="obFeatureLabel">Analytics & Reports</div>
          </div>
        </div>
        <div style="margin-top:24px; display:flex; justify-content:center;">
          <label class="obRestoreBtn" style="cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:10px 16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; color:#475569; font-weight:600; font-size:14px; transition:all 0.2s;">
            <span style="display:flex; width:18px; height:18px;">${ico('upload', 'currentColor')}</span>
            Restore from Backup
            <input type="file" accept=".json" onchange="obImportBackup(event)" style="display:none;">
          </label>
        </div>
      </div>`;
  }

  function buildStep2() {
    const ob = window._ob;
    return `
      <div class="obSectionTitle">School Information</div>
      <div class="obSectionSub">Tell us about your school. You can always update these details in Settings.</div>
      <div class="obFormGrid full">
        <label class="obLabel">School Name <span class="req">*</span>
          <input id="obSchoolName" class="obInput" placeholder="e.g. Oquendo Elementary School" maxlength="120">
        </label>
      </div>
      <div class="obFormGrid full">
        <label class="obLabel">School Address
          <input id="obAddress" class="obInput" placeholder="e.g. Barangay Oquendo, Kalibo, Aklan" maxlength="150">
        </label>
      </div>
      <div class="obFormGrid">
        <label class="obLabel">Division
          <input id="obDivision" class="obInput" placeholder="e.g. Division of Aklan" maxlength="100">
        </label>
        <label class="obLabel">District
          <input id="obDistrict" class="obInput" placeholder="e.g. District of Balete" maxlength="100">
        </label>
      </div>
      <div class="obFormGrid">
        <label class="obLabel">School Year
          <input id="obSchoolYear" class="obInput" placeholder="e.g. 2025–2026" maxlength="40">
        </label>
      </div>
      <div class="obDivider"></div>
      <div class="obSubLabel">School Type <span style="color:var(--danger)">*</span></div>
      <div class="obSchoolTypeGrid">
        ${SCHOOL_TYPES.map(t => `
          <label class="obSchoolTypeChip ${ob.types.includes(t.key) ? 'selected' : ''}" data-type="${t.key}">
            <input type="checkbox" ${ob.types.includes(t.key) ? 'checked' : ''} onchange="obTypeToggle('${t.key}', this.checked)">
            <div class="obSchoolTypeChipIcon" style="width:20px; height:20px; display:flex; align-items:center; justify-content:center;">${ico(t.iconId, t.iconColor)}</div>
            <div class="obSchoolTypeChipText">
              <b>${t.label}</b>
              <span>${t.desc}</span>
            </div>
          </label>`).join('')}
      </div>
      <div class="obDivider"></div>
      <div class="obDivider"></div>
      <div class="obSubLabel">School Logo (Optional)</div>
      <div style="display:flex; gap:16px; align-items:center; margin-top:8px; margin-bottom:12px;">
        <div id="obLogoPreview" style="width:64px; height:64px; border-radius:8px; background:var(--panel); border:1px solid var(--line); display:flex; align-items:center; justify-content:center; font-weight:800; color:var(--text-muted2); overflow:hidden; flex-shrink:0;">
          ${ob.logoDataUrl ? `<img src="${escHtml(ob.logoDataUrl)}" style="width:100%;height:100%;object-fit:contain;border-radius:6px;">` : '<span>Logo</span>'}
        </div>
        <div>
          <p style="margin:0 0 8px 0; font-size:12px; color:var(--text-muted); line-height:1.4;">Upload the official school logo. <br>It will appear in the top navigation bar.</p>
          <label style="cursor:pointer; display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border:1px solid var(--line); border-radius:6px; background:var(--bg); font-size:12px; font-weight:600; color:var(--text); transition:border 0.2s;">
            <span style="display:flex; width:14px; height:14px;">${ico('upload', 'currentColor')}</span> Upload Image
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="display:none" onchange="window.obHandleLogo(this)">
          </label>
        </div>
      </div>`;
  }

  function buildStep3() {
    const ob = window._ob;
    const activeGrades = gradesForTypes(ob.types);
    return `
      <div class="obSectionTitle">Grade Levels & Sections</div>
      <div class="obSectionSub">These grades are pre-selected based on your school type. Check the ones you offer and optionally name your sections (comma-separated).</div>
      <div class="obGradeList" id="obGradeList">
        ${activeGrades.map(g => {
          const checked = ob.grades.length > 0 ? ob.grades.includes(g) : true;
          const sec = ob.sections[g] || '';
          return `
            <div class="obGradeRow ${checked ? 'checked' : ''}">
              <input type="checkbox" data-grade="${g}" ${checked ? 'checked' : ''} onchange="obGradeToggle(this)">
              <span class="obGradeName" onclick="this.previousElementSibling.click()">${g}</span>
              <span class="obSectionHint">Sections:</span>
              <input class="obSectionInput" placeholder="e.g. Sampaguita, Rosal" value="${sec}" ${checked ? '' : 'disabled'}>
            </div>`;
        }).join('')}
      </div>`;
  }

  function buildStep4() {
    const ob = window._ob;
    const activeGrades = ob.grades.length > 0 ? ob.grades : gradesForTypes(ob.types);
    const hasKinder = activeGrades.includes('Kindergarten');
    const esGrades = OB_GRADES_ES.filter(g => activeGrades.includes(g));
    const jhsGrades = OB_GRADES_JHS.filter(g => activeGrades.includes(g));

    let html = `
      <div class="obSectionTitle">Add Subjects</div>
      <div class="obSectionSub">Select the subjects your school offers per grade level. You can add custom ones below.</div>
    `;

    // Reconstruct selected sets for rendering
    const selKinder = new Set();
    const selES = {}; // name -> Set of grades
    const selJHS = {}; // name -> Set of grades
    ob.subjects.forEach(s => {
      if (s.grades.includes('Kindergarten')) selKinder.add(s.name);
      const es = s.grades.filter(g => OB_GRADES_ES.includes(g));
      if (es.length > 0) selES[s.name] = new Set(es);
      const jhs = s.grades.filter(g => OB_GRADES_JHS.includes(g));
      if (jhs.length > 0) selJHS[s.name] = new Set(jhs);
    });

    if (hasKinder) {
      html += `
        <div class="obSubjectSection">
          <div class="obSubjectSectionLabel"><h4>🌱 KINDERGARTEN</h4></div>
          <div class="obSubjectTileGrid">
            ${OB_SUBJECTS_KINDER.map(sub => `
              <div class="obSubjectTile ${selKinder.has(sub) ? 'selected' : ''}" data-name="${sub}" onclick="obToggleKinderTile(this)">${sub}</div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (esGrades.length > 0) {
      html += `
        <div class="obSubjectSection" id="obMatrixES">
          <div class="obSubjectSectionLabel">
            <h4>📚 ELEMENTARY — Grades 1–6</h4>
            <div class="obSectionActions">
              <button onclick="obSelectAllSection('obMatrixES')">Select All</button>
              <button onclick="obClearSection('obMatrixES')">Clear</button>
            </div>
          </div>
          <div class="obSubjectMatrixWrap">
            <table class="obSubjectMatrix">
              <thead>
                <tr>
                  <th>Subject</th>
                  ${esGrades.map(g => `<th>${gradeShort(g)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${OB_SUBJECTS_ES.map(sub => {
                  const active = selES[sub] ? true : false;
                  return `
                    <tr class="${active ? 'active' : ''}" data-name="${sub}">
                      <td class="obSubjectCell" onclick="obToggleMatrixRow(this)"><span class="subIndicator"></span><span>${sub}</span></td>
                      ${esGrades.map(g => {
                        const checked = active && selES[sub].has(g);
                        return `<td><input type="checkbox" data-grade="${g}" ${checked ? 'checked' : ''} onchange="obMatrixCheckChange(this)"></td>`;
                      }).join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (jhsGrades.length > 0) {
      html += `
        <div class="obSubjectSection" id="obMatrixJHS">
          <div class="obSubjectSectionLabel">
            <h4>🎓 SECONDARY / JHS — Grades 7–10</h4>
            <div class="obSectionActions">
              <button onclick="obSelectAllSection('obMatrixJHS')">Select All</button>
              <button onclick="obClearSection('obMatrixJHS')">Clear</button>
            </div>
          </div>
          <div class="obSubjectMatrixWrap">
            <table class="obSubjectMatrix">
              <thead>
                <tr>
                  <th>Subject</th>
                  ${jhsGrades.map(g => `<th>${gradeShort(g)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${OB_SUBJECTS_JHS.map(sub => {
                  const active = selJHS[sub] ? true : false;
                  return `
                    <tr class="${active ? 'active' : ''}" data-name="${sub}">
                      <td class="obSubjectCell" onclick="obToggleMatrixRow(this)"><span class="subIndicator"></span><span>${sub}</span></td>
                      ${jhsGrades.map(g => {
                        const checked = active && selJHS[sub].has(g);
                        return `<td><input type="checkbox" data-grade="${g}" ${checked ? 'checked' : ''} onchange="obMatrixCheckChange(this)"></td>`;
                      }).join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Filter custom subjects (those not in preset lists)
    const customSubjects = ob.subjects.filter(s => {
      const isPresetKinder = OB_SUBJECTS_KINDER.includes(s.name);
      const isPresetES = OB_SUBJECTS_ES.includes(s.name);
      const isPresetJHS = OB_SUBJECTS_JHS.includes(s.name);
      // It's custom if it's not preset, OR if it has grades outside its preset groups
      let hasCustomGrades = false;
      s.grades.forEach(g => {
        if (g === 'Kindergarten' && !isPresetKinder) hasCustomGrades = true;
        if (OB_GRADES_ES.includes(g) && !isPresetES) hasCustomGrades = true;
        if (OB_GRADES_JHS.includes(g) && !isPresetJHS) hasCustomGrades = true;
      });
      return hasCustomGrades;
    });

    html += `
      <div class="obSubLabel" style="margin-top:20px">Custom Subjects</div>
      <div class="obSubjectList" id="obSubjectList">
        ${customSubjects.length === 0 ? '' : customSubjects.map(s => `
          <div class="obSubjectRow">
            <div class="obSubjectRowTop">
              <input class="obSubjectNameInput" value="${escHtml(s.name)}" maxlength="80" placeholder="e.g. Mathematics">
              <button class="obRemoveBtn" onclick="this.closest('.obSubjectRow').remove()" title="Remove">×</button>
            </div>
            <div class="obGradeChips">
              ${activeGrades.map(g => `
                <label class="obGradeChip ${s.grades.includes(g) ? 'checked' : ''}" title="${g}">
                  <input type="checkbox" data-grade="${g}" ${s.grades.includes(g) ? 'checked' : ''} onchange="obChipToggle(this)">
                  ${gradeShort(g)}
                </label>`).join('')}
            </div>
          </div>`).join('')}
      </div>
      <button class="obAddRowBtn" onclick="obAddSubject()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><path d="M12 5v14M5 12h14"/></svg>
        Add Custom Subject
      </button>
      <p class="obSkipNote">You can always add more subjects later via Settings.</p>
    `;

    return html;
  }

  function buildStep5() {
    const ob = window._ob;
    const availLevels = ob.types.length > 0
      ? SCHOOL_TYPES.filter(x => ob.types.includes(x.key)).map(x => ({ key: x.key, label: x.label }))
      : [{ key: 'All', label: 'All Levels' }];

    // Reset editing state whenever this step is built
    ob.editingTeacherIndex = -1;
    setTimeout(() => obRenderTeacherList(), 0);

    return `
      <div class="obSectionTitle">Add Teachers</div>
      <div class="obSectionSub">Add your teaching staff. Assign which subjects they teach and which level they handle.</div>
      
      <div class="obTeacherSplit">
        <!-- Form Pane (Left) -->
        <div class="obTeacherFormPane">
          <div class="obTeacherRowTop">
            <input id="obTFormName" class="obTeacherInput" placeholder="Teacher Name *" maxlength="100">
            <input id="obTFormPos" class="obTeacherInput" placeholder="Position (e.g. Teacher I)" maxlength="80">
          </div>
          
          <div class="obSubLabel">School Level</div>
          <div class="obLevelTags" id="obTFormLevels">
            ${availLevels.map(l => `
              <label class="obLevelTag">
                <input type="checkbox" data-level="${l.key}" onchange="obChipToggle(this)">
                ${l.label}
              </label>`).join('')}
          </div>
          
          <div class="obSubLabel">Subjects Taught</div>
          <div class="obSubjectsTaught" id="obTFormSubjects">
            ${ob.subjects.filter(s => s.name).length > 0
              ? ob.subjects.filter(s => s.name).map(s => `
                  <label class="obSubjectTaughtChip">
                    <input type="checkbox" data-subject="${escHtml(s.name)}" onchange="obChipToggle(this)">
                    ${escHtml(s.name)}
                  </label>`).join('')
              : `<span class="obSubjectsTaughtEmpty">No subjects were added in Step 4</span>`}
          </div>
          
          <button id="obSaveTeacherBtn" class="obSaveTeacherBtn" onclick="obSaveTeacherForm()">Save Teacher</button>
        </div>
        
        <!-- List Pane (Right) -->
        <div class="obTeacherListPane">
          <div class="obTeacherListHeader">Added Teachers (<span id="obTeacherCount">${ob.teachers.length}</span>)</div>
          <div id="obTeacherListRender"></div>
        </div>
      </div>
      
      <div class="obTeacherDivider" style="margin-top:20px;"></div>
      <p class="obSkipNote">You can add more teachers later via Settings → Teachers.</p>`;
  }

  /* ── Restore saved values into restored DOM ─────── */
  function restoreStep(n) {
    const ob = window._ob;
    if (n === 2) {
      setVal('obSchoolName',  ob.schoolName  || (state.schoolConfig && state.schoolConfig.schoolName)  || '');
      setVal('obAddress',     ob.address     || (state.schoolConfig && state.schoolConfig.schoolAddress) || '');
      setVal('obDivision',    ob.division    || (state.schoolConfig && state.schoolConfig.division)    || '');
      setVal('obDistrict',    ob.district    || (state.schoolConfig && state.schoolConfig.district)    || '');
      setVal('obSchoolYear',  ob.schoolYear  || (state.schoolConfig && state.schoolConfig.schoolYear)  || '');
    }
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
  }

  function escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── Footer ─────────────────────────────────────── */
  function buildFooter(n) {
    const isFirst = n === 1;
    const isLast  = n === 5;
    const canSkip = n >= 4;

    return `
      <div class="obFooterLeft">
        ${!isFirst ? `<button class="obBackBtn" onclick="obBack()">← Back</button>` : '<span></span>'}
        ${canSkip ? `<button class="obSkipBtn" onclick="obSkip()">Skip this step</button>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="obValidationMsg" id="obValidMsg"></div>
        <button class="obNextBtn" onclick="obNext()">
          ${isLast ? 'Finish Setup' : 'Continue'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>`;
  }

  /* ── Complete onboarding ────────────────────────── */
  function completeOnboarding() {
    collectStep(window._ob.step);
    const ob = window._ob;

    /* School config */
    state.schoolConfig = state.schoolConfig || {};
    if (ob.schoolName)  state.schoolConfig.schoolName      = ob.schoolName;
    if (ob.address)     state.schoolConfig.schoolAddress   = ob.address;
    if (ob.division)    state.schoolConfig.division         = ob.division;
    if (ob.district)    state.schoolConfig.district         = ob.district;
    if (ob.schoolYear)  state.schoolConfig.schoolYear       = ob.schoolYear;
    if (ob.logoDataUrl) {
      state.schoolConfig.logoDataUrl = ob.logoDataUrl;
      if (typeof extractDominantColor === 'function') {
        extractDominantColor(ob.logoDataUrl, (c) => {
          if (c) {
             state.schoolConfig.logoAccentColor = c;
             save();
             if (typeof applyTheme === 'function') applyTheme(localStorage.getItem('appTheme') || 'light');
          }
        });
      }
      if (typeof renderSchoolLogo === 'function') renderSchoolLogo();
    }
    state.schoolConfig.schoolType = ob.types;

    /* Active school year */
    if (ob.schoolYear) {
      state.activeSchoolYear = ob.schoolYear;
    }

    /* Sections */
    state.sections = state.sections || [];
    ob.grades.forEach(grade => {
      const secStr = ob.sections[grade] || '';
      const secNames = secStr.split(',').map(s => s.trim()).filter(Boolean);
      if (secNames.length > 0) {
        secNames.forEach(name => {
          const exists = state.sections.find(s => s.grade === grade && s.name.toLowerCase() === name.toLowerCase());
          if (!exists) state.sections.push({ id: uid('sec'), grade, name });
        });
      }
    });

    /* Active grades */
    if (ob.grades.length > 0) {
      state.grades = ob.grades;
    }

    /* Subjects */
    const subjectMap = {}; // name -> id
    ob.subjects.forEach(sub => {
      if (!sub.name) return;
      const existing = state.subjects.find(s => s.name.toLowerCase() === sub.name.toLowerCase());
      if (existing) {
        // update tags
        existing.tags = gradeTagsFromGrades(sub.grades);
        subjectMap[sub.name] = existing.id;
      } else {
        const s = { id: uid('s'), name: sub.name, tags: gradeTagsFromGrades(sub.grades) };
        state.subjects.push(s);
        subjectMap[sub.name] = s.id;
      }
    });

    /* Teachers */
    ob.teachers.forEach(t => {
      if (!t.name) return;
      const existing = state.teachers.find(x => x.name.toLowerCase() === t.name.toLowerCase());
      const subjectIds = (t.subjectNames || []).map(n => subjectMap[n]).filter(Boolean);
      const colorIdx = state.teachers.length % palette.length;
      if (existing) {
        if (t.position) existing.position = t.position;
        existing.subjectIds = subjectIds;
        existing.schoolLevel = t.levels;
      } else {
        state.teachers.push({
          id: uid('t'),
          name: t.name,
          position: t.position || '',
          color: palette[colorIdx],
          subjectIds,
          schoolLevel: t.levels,
          room: '',
        });
      }
    });

    /* Mark complete */
    state.onboardingComplete = true;
    state.defaultSubjectsInitialized = state.defaultSubjectsInitialized || false;

    /* Always release the overlay, even if fresh data exposes a render error. */
    try {
      save();
    } finally {
      closeOnboarding();
    }
  }

  function gradeTagsFromGrades(grades) {
    const tags = [];
    if (grades.includes('Kindergarten')) tags.push('Kinder');
    if (['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6'].some(g => grades.includes(g))) tags.push('ES');
    if (['Grade 7','Grade 8','Grade 9','Grade 10'].some(g => grades.includes(g))) tags.push('JHS');
    return tags;
  }

  /* ── Done Screen ────────────────────────────────── */
  function showDoneScreen(ob) {
    const body = document.getElementById('obBody');
    const footer = document.getElementById('obFooter');
    const prog = document.getElementById('obProgressBar');

    if (prog) {
      prog.innerHTML = [1,2,3,4,5].map(n => `
        <div class="obProgressStep done">
          <div class="obStepDot"><span>${n}</span></div>
          <div class="obStepLabel"></div>
        </div>`).join('');
    }

    const teacherCount = ob.teachers.filter(t => t.name).length;
    const subjectCount = ob.subjects.filter(s => s.name).length;
    const gradeCount   = ob.grades.length;

    if (body) {
      body.innerHTML = `
        <div class="obDoneScreen obStep">
          <div class="obDoneIcon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:36px;height:36px">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="obDoneTitle">You're all set! 🎉</div>
          <div class="obDoneSub">Your school profile has been saved. You can now start building your class schedules.</div>
          <div class="obDoneSummary">
            <div class="obDoneStat"><b>${gradeCount}</b><span>Grade Levels</span></div>
            <div class="obDoneStat"><b>${subjectCount}</b><span>Subjects</span></div>
            <div class="obDoneStat"><b>${teacherCount}</b><span>Teachers</span></div>
          </div>
        </div>`;
    }

    if (footer) {
      footer.innerHTML = `
        <span></span>
        <button class="obNextBtn" onclick="closeOnboarding()" style="background:var(--success)">
          Go to Dashboard
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>`;
    }
  }

  window.obHandleLogo = function (input) {
    let file = input && input.files && input.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      alert('Please upload an image file.');
      input.value = ''; return;
    }
    let reader = new FileReader();
    reader.onload = e => {
      let cropFn = window.openCropModal || (typeof openCropModal === 'function' ? openCropModal : null);
      if (cropFn) {
        cropFn(e.target.result, (croppedDataUrl) => {
          if (typeof resizeImage === 'function') {
            resizeImage(croppedDataUrl, 1.5, (resizedDataUrl) => {
              window._ob.logoDataUrl = resizedDataUrl;
              const preview = document.getElementById('obLogoPreview');
              if (preview) {
                preview.innerHTML = `<img src="${escHtml(resizedDataUrl)}" style="width:100%;height:100%;object-fit:contain;border-radius:6px;">`;
              }
            });
          } else {
            window._ob.logoDataUrl = croppedDataUrl;
            const preview = document.getElementById('obLogoPreview');
            if (preview) {
              preview.innerHTML = `<img src="${escHtml(croppedDataUrl)}" style="width:100%;height:100%;object-fit:contain;border-radius:6px;">`;
            }
          }
        });
      } else if (typeof resizeImage === 'function') {
        resizeImage(e.target.result, 1.5, (resizedDataUrl) => {
          window._ob.logoDataUrl = resizedDataUrl;
          const preview = document.getElementById('obLogoPreview');
          if (preview) {
            preview.innerHTML = `<img src="${escHtml(resizedDataUrl)}" style="width:100%;height:100%;object-fit:contain;border-radius:6px;">`;
          }
        });
      } else {
        window._ob.logoDataUrl = e.target.result;
        const preview = document.getElementById('obLogoPreview');
        if (preview) {
          preview.innerHTML = `<img src="${escHtml(e.target.result)}" style="width:100%;height:100%;object-fit:contain;border-radius:6px;">`;
        }
      }
    };
    reader.readAsDataURL(file);
  };

})();
