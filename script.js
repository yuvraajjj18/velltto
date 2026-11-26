/* ==========================================
   VELTO — COMPLETE JAVASCRIPT
   Replace the entire JS panel with this code.
========================================== */

const $ = id => document.getElementById(id);

const STORAGE = {
  profile: "velto-profile",
  tasks: "velto-tasks",
  chapters: "velto-chapters",
  backlog: "velto-backlog",
  habits: "velto-habits",
  goals: "velto-goals",
  errors: "velto-errors",
  theme: "velto-theme"
};

const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

let profile = read(STORAGE.profile, null);
let tasks = read(STORAGE.tasks, []);
let library = read(STORAGE.chapters, []);
let backlog = read(STORAGE.backlog, {});
let habits = read(STORAGE.habits, []);
let goals = read(STORAGE.goals, []);
let errors = read(STORAGE.errors, []);

let selectedBoard = profile?.board || "";
let selectedClass = profile?.class || "";
let selectedStream = profile?.stream || "";
let selectedExam = profile?.exam || "";

let focusSeconds = 25 * 60;
let focusInterval = null;
let editingTaskId = null;

/* ---------- SYLLABUS DATABASE ---------- */

const CHAPTERS = {
  "9": {
    Science: [
      "Matter in Our Surroundings",
      "Is Matter Around Us Pure",
      "Atoms and Molecules",
      "Structure of the Atom",
      "The Fundamental Unit of Life",
      "Tissues",
      "Motion",
      "Force and Laws of Motion",
      "Gravitation",
      "Work and Energy",
      "Sound",
      "Improvement in Food Resources"
    ],
    Mathematics: [
      "Number Systems",
      "Polynomials",
      "Coordinate Geometry",
      "Linear Equations in Two Variables",
      "Introduction to Euclid's Geometry",
      "Lines and Angles",
      "Triangles",
      "Quadrilaterals",
      "Circles",
      "Heron's Formula",
      "Surface Areas and Volumes",
      "Statistics"
    ],
    English: [
      "The Fun They Had",
      "The Sound of Music",
      "The Little Girl",
      "A Truly Beautiful Mind",
      "The Snake and the Mirror",
      "My Childhood",
      "Reach for the Top",
      "Kathmandu",
      "If I Were You"
    ],
    SocialScience: [
      "The French Revolution",
      "Socialism in Europe",
      "Nazism and the Rise of Hitler",
      "India Size and Location",
      "Physical Features of India",
      "Drainage",
      "Climate",
      "Democracy",
      "Constitutional Design",
      "Electoral Politics",
      "People as Resource",
      "Poverty as a Challenge"
    ],
    Hindi: ["अपठित गद्यांश", "व्याकरण", "क्षितिज", "कृतिका", "लेखन"]
  },

  "10": {
    Mathematics: [
      "Real Numbers",
      "Polynomials",
      "Pair of Linear Equations in Two Variables",
      "Quadratic Equations",
      "Arithmetic Progressions",
      "Triangles",
      "Coordinate Geometry",
      "Introduction to Trigonometry",
      "Some Applications of Trigonometry",
      "Circles",
      "Areas Related to Circles",
      "Surface Areas and Volumes",
      "Statistics",
      "Probability"
    ],
    Science: [
      "Chemical Reactions and Equations",
      "Acids, Bases and Salts",
      "Metals and Non-metals",
      "Carbon and its Compounds",
      "Life Processes",
      "Control and Coordination",
      "How do Organisms Reproduce",
      "Heredity",
      "Light – Reflection and Refraction",
      "The Human Eye",
      "Electricity",
      "Magnetic Effects of Electric Current",
      "Our Environment"
    ],
    SocialScience: [
      "The Rise of Nationalism in Europe",
      "Nationalism in India",
      "The Making of a Global World",
      "The Age of Industrialisation",
      "Print Culture",
      "Resources and Development",
      "Forest and Wildlife",
      "Water Resources",
      "Agriculture",
      "Minerals and Energy Resources",
      "Power Sharing",
      "Federalism",
      "Gender Religion and Caste",
      "Political Parties",
      "Development",
      "Sectors of the Indian Economy",
      "Money and Credit",
      "Globalisation"
    ],
    English: [
      "A Letter to God",
      "Nelson Mandela",
      "Two Stories About Flying",
      "From the Diary of Anne Frank",
      "Glimpses of India",
      "Mijbil the Otter",
      "Madam Rides the Bus",
      "The Sermon at Benares",
      "The Proposal"
    ],
    Hindi: ["बड़े भाई साहब", "डायरी का एक पन्ना", "तताँरा-वामीरो कथा", "तीसरी कसम", "व्याकरण", "लेखन"]
  },

  "11": {
    Physics: [
      "Units and Measurements",
      "Motion in a Straight Line",
      "Motion in a Plane",
      "Laws of Motion",
      "Work Energy and Power",
      "System of Particles and Rotational Motion",
      "Gravitation",
      "Mechanical Properties of Solids",
      "Mechanical Properties of Fluids",
      "Thermal Properties of Matter",
      "Thermodynamics",
      "Kinetic Theory",
      "Oscillations",
      "Waves"
    ],
    Chemistry: [
      "Some Basic Concepts of Chemistry",
      "Structure of Atom",
      "Classification of Elements",
      "Chemical Bonding",
      "Chemical Thermodynamics",
      "Equilibrium",
      "Redox Reactions",
      "Organic Chemistry: Basic Principles",
      "Hydrocarbons"
    ],
    Mathematics: [
      "Sets",
      "Relations and Functions",
      "Trigonometric Functions",
      "Complex Numbers",
      "Linear Inequalities",
      "Permutations and Combinations",
      "Binomial Theorem",
      "Sequences and Series",
      "Straight Lines",
      "Conic Sections",
      "Introduction to Three Dimensional Geometry",
      "Limits and Derivatives",
      "Statistics",
      "Probability"
    ],
    Biology: [
      "The Living World",
      "Biological Classification",
      "Plant Kingdom",
      "Animal Kingdom",
      "Morphology of Flowering Plants",
      "Anatomy of Flowering Plants",
      "Structural Organisation in Animals",
      "Cell: The Unit of Life",
      "Biomolecules",
      "Cell Cycle and Cell Division",
      "Photosynthesis",
      "Respiration in Plants",
      "Plant Growth and Development",
      "Breathing and Exchange of Gases",
      "Body Fluids and Circulation",
      "Excretory Products and their Elimination",
      "Locomotion and Movement",
      "Neural Control and Coordination",
      "Chemical Coordination and Integration"
    ],
    English: ["Reading Skills", "Writing Skills", "Grammar", "Hornbill", "Snapshots"],
    Economics: ["Introduction to Economics", "Statistics", "Collection of Data", "Organisation of Data", "Measures of Central Tendency"],
    Accountancy: ["Introduction to Accounting", "Theory Base of Accounting", "Recording of Transactions", "Trial Balance", "Bank Reconciliation"]
  },

  "12": {
    Physics: [
      "Electric Charges and Fields",
      "Electrostatic Potential and Capacitance",
      "Current Electricity",
      "Moving Charges and Magnetism",
      "Magnetism and Matter",
      "Electromagnetic Induction",
      "Alternating Current",
      "Electromagnetic Waves",
      "Ray Optics",
      "Wave Optics",
      "Dual Nature of Radiation and Matter",
      "Atoms",
      "Nuclei",
      "Semiconductor Electronics"
    ],
    Chemistry: [
      "Solutions",
      "Electrochemistry",
      "Chemical Kinetics",
      "d and f Block Elements",
      "Coordination Compounds",
      "Haloalkanes and Haloarenes",
      "Alcohols Phenols and Ethers",
      "Aldehydes Ketones and Carboxylic Acids",
      "Amines",
      "Biomolecules"
    ],
    Mathematics: [
      "Relations and Functions",
      "Inverse Trigonometric Functions",
      "Matrices",
      "Determinants",
      "Continuity and Differentiability",
      "Applications of Derivatives",
      "Integrals",
      "Applications of Integrals",
      "Differential Equations",
      "Vector Algebra",
      "Three Dimensional Geometry",
      "Linear Programming",
      "Probability"
    ],
    Biology: [
      "Sexual Reproduction in Flowering Plants",
      "Human Reproduction",
      "Reproductive Health",
      "Principles of Inheritance and Variation",
      "Molecular Basis of Inheritance",
      "Evolution",
      "Human Health and Disease",
      "Microbes in Human Welfare",
      "Biotechnology: Principles and Processes",
      "Biotechnology and its Applications",
      "Organisms and Populations",
      "Ecosystem",
      "Biodiversity and Conservation"
    ],
    English: ["Reading Skills", "Writing Skills", "Grammar", "Flamingo", "Vistas"],
    Economics: ["National Income", "Money and Banking", "Determination of Income", "Government Budget", "Balance of Payments"],
    Accountancy: ["Accounting for Partnership Firms", "Company Accounts", "Financial Statements", "Cash Flow Statement"],
    BusinessStudies: ["Nature and Significance of Management", "Principles of Management", "Business Environment", "Planning", "Organising", "Staffing", "Directing", "Controlling", "Financial Management", "Marketing Management"]
  }
};

function getSubjects() {
  if (!profile) return [];
  const data = CHAPTERS[String(profile.class)] || {};
  let subjects = Object.keys(data);

  if (profile.stream === "PCM") {
    subjects = subjects.filter(s => ["Physics", "Chemistry", "Mathematics", "English"].includes(s));
  } else if (profile.stream === "PCB") {
    subjects = subjects.filter(s => ["Physics", "Chemistry", "Biology", "English"].includes(s));
  } else if (profile.stream === "PCMB") {
    subjects = subjects.filter(s => ["Physics", "Chemistry", "Mathematics", "Biology", "English"].includes(s));
  }

  return subjects;
}

function getChapters(subject) {
  return (CHAPTERS[String(profile?.class)] || {})[subject] || [];
}

/* ---------- STORAGE ---------- */

function saveAll() {
  localStorage.setItem(STORAGE.profile, JSON.stringify(profile));
  localStorage.setItem(STORAGE.tasks, JSON.stringify(tasks));
  localStorage.setItem(STORAGE.chapters, JSON.stringify(library));
  localStorage.setItem(STORAGE.backlog, JSON.stringify(backlog));
  localStorage.setItem(STORAGE.habits, JSON.stringify(habits));
  localStorage.setItem(STORAGE.goals, JSON.stringify(goals));
  localStorage.setItem(STORAGE.errors, JSON.stringify(errors));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

/* ---------- SETUP OPTIONS ---------- */

function selectOption(container, value, attribute = "data-value") {
  if (!container) return;

  container.querySelectorAll(".choice-btn").forEach(button => {
    const selected = button.getAttribute(attribute) === String(value);
    button.classList.toggle("selected", selected);
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function setupOptionListeners(containerId, attribute, callback) {
  const container = $(containerId);
  if (!container) return;

  container.querySelectorAll(".choice-btn").forEach(button => {
    button.addEventListener("click", () => {
      const value = button.getAttribute(attribute);
      if (value === null) return;
      callback(value);
    });
  });
}

function setupSetupListeners() {
  setupOptionListeners("boardOptions", "data-value", value => {
    selectedBoard = value;
    selectOption($("boardOptions"), value);
  });

  setupOptionListeners("classOptions", "data-value", value => {
    selectedClass = value;
    selectOption($("classOptions"), value);

    selectedStream = "";
    selectOption($("streamOptions"), "");

    const streamSection = $("streamSection");
    if (streamSection) {
      streamSection.style.display =
        ["11", "12"].includes(value) ? "" : "none";
    }
  });

  setupOptionListeners("streamOptions", "data-value", value => {
    selectedStream = value;
    selectOption($("streamOptions"), value);
  });

  setupOptionListeners("examOptions", "data-value", value => {
    selectedExam = value;
    selectOption($("examOptions"), value);
  });

  const finish = $("finishSetup");
  if (finish) {
    finish.addEventListener("click", () => {
      if (!selectedBoard || !selectedClass || !selectedExam) {
        alert("Please select your board, class and target.");
        return;
      }

      if (["11", "12"].includes(selectedClass) && !selectedStream) {
        alert("Please select your stream.");
        return;
      }

      profile = {
        board: selectedBoard,
        class: selectedClass,
        stream: selectedStream,
        exam: selectedExam
      };

      saveAll();
      launchApp();
    });
  }
}

/* ---------- APP NAVIGATION ---------- */

function showPage(page) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.toggle("active", section.id === page);
  });

  document.querySelectorAll("[data-page]").forEach(button => {
    if (button.classList.contains("nav-btn")) {
      button.classList.toggle("active", button.dataset.page === page);
    }
  });

  const heading = $( "pageHeading" );
  if (heading) {
    heading.textContent = page.charAt(0).toUpperCase() + page.slice(1);
  }

  const sidebar = $("sidebar");
  if (sidebar) sidebar.classList.remove("open");

  if (page === "backlog") renderBacklog();
  if (page === "syllabus") renderSyllabus();
  if (page === "calendar") renderCalendar();
}

function setupNavigation() {
  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.page));
  });

  const menuToggle = $("menuToggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      $("sidebar")?.classList.toggle("open");
    });
  }
}

/* ---------- TASK PLANNER ---------- */

function addTask() {
  const title = $("taskInput")?.value.trim();
  const subject = $("subjectInput")?.value.trim();
  const date = $("dateInput")?.value;
  const priority = $("priorityInput")?.value || "Medium";

  if (!title) {
    alert("Enter a task first.");
    return;
  }

  tasks.push({
    id: uid(),
    title,
    subject,
    date,
    priority,
    done: false,
    created: new Date().toISOString()
  });

  if ($("taskInput")) $("taskInput").value = "";
  if ($("subjectInput")) $("subjectInput").value = "";
  saveAll();
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  task.done = !task.done;
  saveAll();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(item => item.id !== id);
  saveAll();
  renderTasks();
}

function openEditTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  editingTaskId = id;
  $("editTaskTitle").value = task.title;
  $("editModal").style.display = "flex";
}

function saveEditedTask() {
  const task = tasks.find(item => item.id === editingTaskId);
  const title = $("editTaskTitle")?.value.trim();

  if (!task || !title) return;

  task.title = title;
  saveAll();
  renderTasks();
  $("editModal").style.display = "none";
  editingTaskId = null;
}

function renderTasks() {
  const list = $("taskList");
  if (list) {
    list.innerHTML = tasks.length ? tasks.map(task => `
      <div class="task-row ${task.done ? "completed" : ""}">
        <label>
          <input type="checkbox" ${task.done ? "checked" : ""}
            onchange="toggleTask('${task.id}')">
          <span>${escapeHTML(task.title)}</span>
        </label>
        <span>${escapeHTML(task.subject || "General")}</span>
        <span>${escapeHTML(task.date || "No date")}</span>
        <span class="priority-${String(task.priority || "Medium").toLowerCase()}">
        <button onclick="openEditTask('${task.id}')">Edit</button>
        <button onclick="deleteTask('${task.id}')">×</button>
      </div>
    `).join("") : `<p class="empty-state">No tasks yet. Add your first task above.</p>`;
  }

  const total = tasks.length;
  const completed = tasks.filter(task => task.done).length;
  const percent = total ? Math.round(completed / total * 100) : 0;

  if ($("totalTasks")) $("totalTasks").textContent = total;
  if ($("completedTasks")) $("completedTasks").textContent = completed;
  if ($("taskProgress")) $("taskProgress").textContent = percent + "%";

  const overview = $("overviewTasks");
  if (overview) {
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = tasks.filter(task => !task.date || task.date === today).slice(0, 5);

    overview.innerHTML = todayTasks.length ? todayTasks.map(task => `
      <div class="mini-task">
        <label>
          <input type="checkbox" ${task.done ? "checked" : ""}
            onchange="toggleTask('${task.id}')">
          ${escapeHTML(task.title)}
        </label>
      </div>
    `).join("") : `<p class="empty-state">Nothing scheduled for today.</p>`;
  }

  renderCalendar();
}

/* ---------- BACKLOG MATRIX ---------- */

function chapterKey(subject, chapter) {
  return `${profile?.class || ""}_${subject}_${chapter}`;
}

function getChapterProgress(subject, chapter) {
  return backlog[chapterKey(subject, chapter)] || {
    lecture: false,
    notes: false,
    practice: false,
    dpp: false,
    test: false
  };
}

function chapterStatus(progress) {
  const values = Object.values(progress);
  const done = values.filter(Boolean).length;
  if (done === values.length) return "done";
  if (done === 0) return "pending";
  return "progress";
}

function updateBacklog(subject, chapter, field, checked) {
  const key = chapterKey(subject, chapter);
  if (!backlog[key]) backlog[key] = getChapterProgress(subject, chapter);
  backlog[key][field] = checked;
  saveAll();
  renderBacklog();
  renderOverviewChapters();
}

function renderBacklog() {
  const body = $("backlogTableBody");
  if (!body) return;

  const subjects = getSubjects();
  const subjectFilter = $("backlogSubjectFilter");
  const statusFilter = $("backlogStatusFilter");

  if (subjectFilter && subjectFilter.options.length <= 1) {
    subjects.forEach(subject => {
      subjectFilter.add(new Option(subject, subject));
    });
  }

  const selectedSubject = subjectFilter?.value || "all";
  const selectedStatus = statusFilter?.value || "all";

  let rows = [];

  subjects.forEach(subject => {
    if (selectedSubject !== "all" && selectedSubject !== subject) return;

    getChapters(subject).forEach(chapter => {
      const progress = getChapterProgress(subject, chapter);
      const status = chapterStatus(progress);

      if (selectedStatus !== "all" && selectedStatus !== status) return;

      rows.push({ subject, chapter, progress, status });
    });
  });

  body.innerHTML = rows.length ? rows.map(row => `
    <tr>
      <td>${escapeHTML(row.subject)}</td>
      <td>${escapeHTML(row.chapter)}</td>
      ${["lecture", "notes", "practice", "dpp", "test"].map(field => `
        <td>
          <input type="checkbox"
            ${row.progress[field] ? "checked" : ""}
            onchange="updateBacklog('${escapeHTML(row.subject)}','${escapeHTML(row.chapter)}','${field}',this.checked)">
        </td>
      `).join("")}
      <td><span class="status-pill ${row.status}">${row.status === "done" ? "Completed" : row.status === "progress" ? "In Progress" : "Pending"}</span></td>
    </tr>
  `).join("") : `<tr><td colspan="8">No chapters found for this filter.</td></tr>`;

  const total = rows.length;
  const completed = rows.filter(row => row.status === "done").length;
  const inProgress = rows.filter(row => row.status === "progress").length;

  if ($("backlogSummary")) {
    $("backlogSummary").innerHTML = `
      <span>Total: ${total}</span>
      <span>Completed: ${completed}</span>
      <span>In progress: ${inProgress}</span>
    `;
  }
}

/* ---------- CHAPTER LIBRARY ---------- */

function populateSyllabusSubjects() {
  const subjectSelect = $("syllabusSubject");
  const backlogSelect = $("backlogSubjectFilter");
  if (!subjectSelect) return;

  const subjects = getSubjects();

  subjectSelect.innerHTML = `<option value="">Select subject</option>`;
  subjects.forEach(subject => {
    subjectSelect.add(new Option(subject, subject));
  });

  if (backlogSelect) {
    backlogSelect.innerHTML = `<option value="all">All Subjects</option>`;
    subjects.forEach(subject => backlogSelect.add(new Option(subject, subject)));
  }
}

function populateSyllabusChapters() {
  const subject = $("syllabusSubject")?.value;
  const chapterSelect = $("syllabusChapter");
  if (!chapterSelect) return;

  chapterSelect.innerHTML = `<option value="">Select chapter</option>`;
  getChapters(subject).forEach(chapter => {
    chapterSelect.add(new Option(chapter, chapter));
  });
}

function addSyllabusChapter() {
  const subject = $("syllabusSubject")?.value;
  const chapter = $("syllabusChapter")?.value;

  if (!subject || !chapter) {
    alert("Select a subject and chapter.");
    return;
  }

  const exists = library.some(item =>
    item.subject === subject && item.chapter === chapter
  );

  if (exists) {
    alert("This chapter is already in your library.");
    return;
  }

  library.push({
    id: uid(),
    subject,
    chapter,
    done: false
  });

  saveAll();
  renderSyllabus();
}

function toggleLibraryChapter(id) {
  const item = library.find(chapter => chapter.id === id);
  if (!item) return;
  item.done = !item.done;
  saveAll();
  renderSyllabus();
}

function removeLibraryChapter(id) {
  library = library.filter(item => item.id !== id);
  saveAll();
  renderSyllabus();
}

function renderSyllabus() {
  const list = $("syllabusChapterList");
  if (!list) return;

  const total = library.length;
  const completed = library.filter(item => item.done).length;
  const percent = total ? Math.round(completed / total * 100) : 0;

  if ($("syllabusProgress")) $("syllabusProgress").textContent = percent + "%";
  if ($("syllabusProgressBar")) $("syllabusProgressBar").style.width = percent + "%";
  if ($("overviewChapters")) $("overviewChapters").textContent = total;

  list.innerHTML = library.length ? library.map(item => `
    <div class="chapter-row ${item.done ? "completed" : ""}">
      <label>
        <input type="checkbox" ${item.done ? "checked" : ""}
          onchange="toggleLibraryChapter('${item.id}')">
        <span>${escapeHTML(item.chapter)}</span>
      </label>
      <small>${escapeHTML(item.subject)}</small>
      <button onclick="removeLibraryChapter('${item.id}')">Remove</button>
    </div>
  `).join("") : `<p class="empty-state">Your library is empty. Select chapters above to add them.</p>`;

  renderOverviewChapters();
}

function renderOverviewChapters() {
  const container = $("overviewChapterProgress");
  if (!container) return;

  const total = library.length;
  const completed = library.filter(item => item.done).length;
  const percent = total ? Math.round(completed / total * 100) : 0;

  container.innerHTML = `
    <div class="progress-track">
      <div class="progress-fill" style="width:${percent}%"></div>
    </div>
    <p>${completed} of ${total} chapters completed · ${percent}%</p>
  `;
}

/* ---------- CALENDAR ---------- */

function renderCalendar() {
  const container = $("calendarList");
  if (!container) return;

  const upcoming = tasks
    .filter(task => task.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  container.innerHTML = upcoming.length ? upcoming.map(task => `
    <div class="calendar-row">
      <strong>${escapeHTML(task.date)}</strong>
      <span>${escapeHTML(task.title)}</span>
      <small>${escapeHTML(task.subject || "General")}</small>
      <span>${task.done ? "Completed" : "Pending"}</span>
    </div>
  `).join("") : `<p class="empty-state">Your dated tasks will appear here.</p>`;
}

/* ---------- HABITS ---------- */

function addHabit() {
  const input = $("habitInput");
  const name = input?.value.trim();
  if (!name) return;

  habits.push({ id: uid(), name, done: false });
  input.value = "";
  saveAll();
  renderHabits();
}

function toggleHabit(id) {
  const habit = habits.find(item => item.id === id);
  if (!habit) return;
  habit.done = !habit.done;
  saveAll();
  renderHabits();
}

function deleteHabit(id) {
  habits = habits.filter(item => item.id !== id);
  saveAll();
  renderHabits();
}

function renderHabits() {
  const list = $("habitList");
  if (!list) return;

  list.innerHTML = habits.length ? habits.map(habit => `
    <div class="habit-row">
      <label>
        <input type="checkbox" ${habit.done ? "checked" : ""}
          onchange="toggleHabit('${habit.id}')">
        ${escapeHTML(habit.name)}
      </label>
      <button onclick="deleteHabit('${habit.id}')">×</button>
    </div>
  `).join("") : `<p class="empty-state">No habits added yet.</p>`;
}

/* ---------- GOALS ---------- */

function addGoal() {
  const input = $("goalInput");
  const name = input?.value.trim();
  if (!name) return;

  goals.push({ id: uid(), name, done: false });
  input.value = "";
  saveAll();
  renderGoals();
}

function toggleGoal(id) {
  const goal = goals.find(item => item.id === id);
  if (!goal) return;
  goal.done = !goal.done;
  saveAll();
  renderGoals();
}

function deleteGoal(id) {
  goals = goals.filter(item => item.id !== id);
  saveAll();
  renderGoals();
}

function renderGoals() {
  const list = $("goalList");
  if (!list) return;

  list.innerHTML = goals.length ? goals.map(goal => `
    <div class="goal-row">
      <label>
        <input type="checkbox" ${goal.done ? "checked" : ""}
          onchange="toggleGoal('${goal.id}')">
        ${escapeHTML(goal.name)}
      </label>
      <button onclick="deleteGoal('${goal.id}')">×</button>
    </div>
  `).join("") : `<p class="empty-state">Add a goal to get started.</p>`;
}

/* ---------- ERROR VAULT ---------- */

function addError() {
  const input = $("errorInput");
  const text = input?.value.trim();
  if (!text) return;

  errors.unshift({ id: uid(), text, date: new Date().toLocaleDateString() });
  input.value = "";
  saveAll();
  renderErrors();
}

function deleteError(id) {
  errors = errors.filter(item => item.id !== id);
  saveAll();
  renderErrors();
}

function renderErrors() {
  const list = $("errorList");
  if (!list) return;

  list.innerHTML = errors.length ? errors.map(item => `
    <div class="error-row">
      <div>
        <p>${escapeHTML(item.text)}</p>
        <small>${escapeHTML(item.date)}</small>
      </div>
      <button onclick="deleteError('${item.id}')">×</button>
    </div>
  `).join("") : `<p class="empty-state">Your saved mistakes will appear here.</p>`;
}

/* ---------- FOCUS TIMER ---------- */

function updateFocusDisplay() {
  const display = $("focusTimer");
  if (!display) return;

  const minutes = Math.floor(focusSeconds / 60);
  const seconds = focusSeconds % 60;
  display.textContent =
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");
}

function startFocus() {
  if (focusInterval) return;

  focusInterval = setInterval(() => {
    if (focusSeconds > 0) {
      focusSeconds--;
      updateFocusDisplay();
    } else {
      clearInterval(focusInterval);
      focusInterval = null;
      alert("Focus session complete. Take a short break.");
    }
  }, 1000);
}

function pauseFocus() {
  clearInterval(focusInterval);
  focusInterval = null;
}

function resetFocus() {
  pauseFocus();
  focusSeconds = 25 * 60;
  updateFocusDisplay();
}

/* ---------- TEACHER HUB ---------- */

function setupTeacherHub() {
  document.querySelectorAll(".teacher-filter").forEach(button => {
    button.addEventListener("click", () => {
      const group = button.dataset.teacherGroup;

      document.querySelectorAll(".teacher-filter").forEach(item => {
        item.classList.toggle("active", item === button);
      });

      document.querySelectorAll(".teacher-group").forEach(item => {
        item.style.display = item.dataset.group === group ? "" : "none";
      });
    });
  });
}

/* ---------- THEME ---------- */

function setupTheme() {
  const savedTheme = read(STORAGE.theme, "dark");
  document.body.classList.toggle("light-theme", savedTheme === "light");

  $("themeToggle")?.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-theme");
    localStorage.setItem(STORAGE.theme, JSON.stringify(isLight ? "light" : "dark"));
  });
}

/* ---------- JARVIS INTERFACE ---------- */

function sendJarvisMessage() {
  const input = $("jarvisInput");
  const messages = $("jarvisMessages");
  const question = input?.value.trim();

  if (!question || !messages) return;

  messages.insertAdjacentHTML("beforeend", `
    <div class="jarvis-message user-message">${escapeHTML(question)}</div>
  `);

  const q = question.toLowerCase();
  let answer = "I can help you organize tasks, chapters, and your study workflow.";

  if (q.includes("task")) {
    answer = `You have ${tasks.filter(t => !t.done).length} pending tasks and ${tasks.filter(t => t.done).length} completed tasks.`;
  } else if (q.includes("chapter") || q.includes("syllabus")) {
    answer = `Your library has ${library.length} chapters, with ${library.filter(c => c.done).length} completed.`;
  } else if (q.includes("backlog")) {
    const total = Object.keys(backlog).length;
    answer = `You have tracked progress for ${total} chapter entries in your Backlog Matrix.`;
  } else if (q.includes("goal")) {
    answer = `You have ${goals.length} goals, and ${goals.filter(g => g.done).length} completed.`;
  } else if (q.includes("hello") || q.includes("hi")) {
    answer = "Hello! VELTO systems are online. What would you like to organize?";
  } else if (q.includes("focus")) {
    answer = "Open the Focus page to start a 25-minute focus session.";
  } else if (q.includes("help")) {
    answer = "Try asking: How many tasks are pending? How is my chapter progress? Show my goals.";
  }

  setTimeout(() => {
    messages.insertAdjacentHTML("beforeend", `
      <div class="jarvis-message bot-message">${escapeHTML(answer)}</div>
    `);
    messages.scrollTop = messages.scrollHeight;
  }, 250);

  input.value = "";
  messages.scrollTop = messages.scrollHeight;
}

/* ---------- PROFILE + APP START ---------- */

function updateProfileUI() {
  if ($("profileClass")) {
    $("profileClass").textContent = `Class ${profile.class}`;
  }

  if ($("profileBoard")) {
    $("profileBoard").textContent = profile.board;
  }

  if ($("profileStream")) {
    $("profileStream").textContent = profile.stream || "";
  }
}

function launchApp() {
  if ($("setupScreen")) $("setupScreen").style.display = "none";
  if ($("appShell")) $("appShell").style.display = "";

  updateProfileUI();
  populateSyllabusSubjects();
  renderAll();
  showPage("overview");
}

function renderAll() {
  renderTasks();
  renderBacklog();
  renderSyllabus();
  renderHabits();
  renderGoals();
  renderErrors();
  renderCalendar();
  updateFocusDisplay();
}

function setupEventButtons() {
  $("addTaskButton")?.addEventListener("click", addTask);
  $("addSyllabusChapter")?.addEventListener("click", addSyllabusChapter);
  $("syllabusSubject")?.addEventListener("change", populateSyllabusChapters);
  $("backlogSubjectFilter")?.addEventListener("change", renderBacklog);
  $("backlogStatusFilter")?.addEventListener("change", renderBacklog);

  $("addHabit")?.addEventListener("click", addHabit);
  $("addGoal")?.addEventListener("click", addGoal);
  $("addError")?.addEventListener("click", addError);

  $("startFocus")?.addEventListener("click", startFocus);
  $("pauseFocus")?.addEventListener("click", pauseFocus);
  $("resetFocus")?.addEventListener("click", resetFocus);

  $("jarvisSend")?.addEventListener("click", sendJarvisMessage);
  $("jarvisInput")?.addEventListener("keydown", event => {
    if (event.key === "Enter") sendJarvisMessage();
  });

  $("cancelEdit")?.addEventListener("click", () => {
    $("editModal").style.display = "none";
    editingTaskId = null;
  });

  $("saveEdit")?.addEventListener("click", saveEditedTask);

  $("editModal")?.addEventListener("click", event => {
    if (event.target.id === "editModal") {
      $("editModal").style.display = "none";
    }
  });
}

/* ---------- INITIALIZATION ---------- */

function init() {
  setupSetupListeners();
  setupNavigation();
  setupEventButtons();
  setupTeacherHub();
  setupTheme();

  if (profile) {
    launchApp();
  } else {
    if ($("setupScreen")) $("setupScreen").style.display = "";
    if ($("appShell")) $("appShell").style.display = "none";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}