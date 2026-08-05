const STORAGE_KEY = "lifeDashboard.tasks.v1";
const SCOPE_KEY = "lifeDashboard.scope.v1";

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const PRIORITY_EMOJI = { high: "🔴", medium: "🟡", low: "🔵" };
const CATEGORY_EMOJI = { work: "💼", personal: "🏡" };

/** @typedef {{id:string, title:string, category:'work'|'personal', priority:'high'|'medium'|'low', due:string|null, notes:string, done:boolean, createdAt:number, completedAt:number|null}} Task */

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to load tasks", err);
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

let tasks = loadTasks();
let scope = localStorage.getItem(SCOPE_KEY) || "all";

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayISO() {
  return toISO(new Date());
}

function offsetISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISO(d);
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function addTask({ title, category, priority, due, notes }) {
  tasks.push({
    id: makeId(),
    title: title.trim(),
    category,
    priority,
    due: due || null,
    notes: notes.trim(),
    done: false,
    createdAt: Date.now(),
    completedAt: null,
  });
  saveTasks(tasks);
  render();
}

function toggleDone(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.done = !t.done;
  t.completedAt = t.done ? Date.now() : null;
  saveTasks(tasks);
  render();
}

function updateTask(id, { title, category, priority, due, notes }) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.title = title.trim();
  t.category = category;
  t.priority = priority;
  t.due = due || null;
  t.notes = notes.trim();
  saveTasks(tasks);
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((x) => x.id !== id);
  saveTasks(tasks);
  render();
}

function requestDeleteTask(id) {
  const task = tasks.find((x) => x.id === id);
  if (!task) return;
  deleteTask(id);
  showToast(`Deleted "${task.title}"`, () => {
    tasks.push(task);
    saveTasks(tasks);
    render();
  });
}

const toastEl = document.getElementById("toast");
const toastMessageEl = document.getElementById("toast-message");
const toastUndoBtn = document.getElementById("toast-undo-btn");
let toastTimeoutId = null;
let toastUndoHandler = null;

function showToast(message, onUndo) {
  clearTimeout(toastTimeoutId);
  toastMessageEl.textContent = message;
  toastUndoHandler = onUndo;
  toastEl.hidden = false;
  toastTimeoutId = setTimeout(() => {
    toastEl.hidden = true;
    toastUndoHandler = null;
  }, 5000);
}

toastUndoBtn.addEventListener("click", () => {
  clearTimeout(toastTimeoutId);
  toastEl.hidden = true;
  if (toastUndoHandler) toastUndoHandler();
  toastUndoHandler = null;
});

function inScope(task) {
  return scope === "all" || task.category === scope;
}

function sortTasks(list) {
  return list.slice().sort((a, b) => {
    const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (pd !== 0) return pd;
    const ad = a.due || "9999-99-99";
    const bd = b.due || "9999-99-99";
    if (ad !== bd) return ad < bd ? -1 : 1;
    return a.createdAt - b.createdAt;
  });
}

function formatDue(due) {
  if (!due) return "";
  const today = todayISO();
  if (due === today) return "Today";
  const d = new Date(due + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  const diffDays = Math.round((d - t) / 86400000);
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const template = document.getElementById("task-item-template");

function renderTaskItem(task) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.id = task.id;
  node.classList.toggle("is-done", task.done);
  node.dataset.priority = task.priority;

  const checkbox = node.querySelector('input[type="checkbox"]');
  checkbox.checked = task.done;
  checkbox.addEventListener("change", () => toggleDone(task.id));

  const priorityBadge = node.querySelector(".priority-badge");
  priorityBadge.textContent = `${PRIORITY_EMOJI[task.priority]} ${task.priority}`;
  priorityBadge.classList.add(`priority-${task.priority}`);

  node.querySelector(".task-title").textContent = task.title;

  const categoryBadge = node.querySelector(".category-badge");
  categoryBadge.textContent = `${CATEGORY_EMOJI[task.category]} ${task.category}`;
  categoryBadge.classList.add(`category-${task.category}`);

  const dueEl = node.querySelector(".task-due");
  if (task.due) {
    dueEl.textContent = formatDue(task.due);
    if (task.due < todayISO() && !task.done) dueEl.classList.add("is-overdue");
  } else {
    dueEl.remove();
  }

  const notesEl = node.querySelector(".task-notes");
  if (task.notes) {
    notesEl.textContent = task.notes;
  } else {
    notesEl.remove();
  }

  node.querySelector(".task-edit").addEventListener("click", () => enterEditMode(task));

  node.querySelector(".task-delete").addEventListener("click", () => {
    requestDeleteTask(task.id);
  });

  return node;
}

function renderList(listEl, hintEl, list) {
  listEl.innerHTML = "";
  list.forEach((t) => listEl.appendChild(renderTaskItem(t)));
  if (hintEl) hintEl.hidden = list.length > 0;
}

function render() {
  const visible = tasks.filter(inScope);
  const active = visible.filter((t) => !t.done);
  const today = todayISO();

  const todayAndOverdue = sortTasks(active.filter((t) => t.due && t.due <= today));
  const upcoming = sortTasks(active.filter((t) => t.due && t.due > today));
  const someday = sortTasks(active.filter((t) => !t.due));
  const completed = visible
    .filter((t) => t.done)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  renderList(document.getElementById("list-today"), document.getElementById("hint-today"), todayAndOverdue);
  renderList(document.getElementById("list-upcoming"), document.getElementById("hint-upcoming"), upcoming);
  renderList(document.getElementById("list-someday"), document.getElementById("hint-someday"), someday);
  renderList(document.getElementById("list-completed"), null, completed);

  document.getElementById("completed-count").textContent = completed.length;

  renderStats(active, todayAndOverdue, completed);
}

function renderStats(active, todayAndOverdue, completed) {
  const highCount = active.filter((t) => t.priority === "high").length;
  const stats = [
    { label: `${active.length} open`, cls: "" },
    { label: `${todayAndOverdue.length} due today/overdue`, cls: "priority-high" },
    { label: `${highCount} high priority`, cls: "priority-high" },
    { label: `${completed.length} done`, cls: "priority-low" },
  ];
  const strip = document.getElementById("stats-strip");
  strip.innerHTML = "";
  stats.forEach((s) => {
    const pill = document.createElement("span");
    pill.className = `stat-pill ${s.cls}`;
    pill.textContent = s.label;
    strip.appendChild(pill);
  });
}

let editingTaskId = null;
const taskSubmitBtn = document.getElementById("task-submit-btn");
const taskCancelEditBtn = document.getElementById("task-cancel-edit-btn");

function resetForm() {
  document.getElementById("task-form").reset();
  document.getElementById("task-priority").value = "medium";
  updateDateUI();
}

function enterEditMode(task) {
  editingTaskId = task.id;
  document.getElementById("task-title").value = task.title;
  document.getElementById("task-category").value = task.category;
  document.getElementById("task-priority").value = task.priority;
  document.getElementById("task-notes").value = task.notes || "";
  dueInput.value = task.due || "";
  updateDateUI();
  taskSubmitBtn.textContent = "Save";
  taskCancelEditBtn.hidden = false;
  document.querySelector(".quick-add").scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("task-title").focus();
}

function exitEditMode() {
  editingTaskId = null;
  taskSubmitBtn.textContent = "Add";
  taskCancelEditBtn.hidden = true;
  resetForm();
}

taskCancelEditBtn.addEventListener("click", exitEditMode);

document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("task-title").value;
  if (!title.trim()) return;
  const payload = {
    title,
    category: document.getElementById("task-category").value,
    priority: document.getElementById("task-priority").value,
    due: document.getElementById("task-due").value,
    notes: document.getElementById("task-notes").value,
  };
  if (editingTaskId) {
    updateTask(editingTaskId, payload);
    editingTaskId = null;
    taskSubmitBtn.textContent = "Add";
    taskCancelEditBtn.hidden = true;
  } else {
    addTask(payload);
  }
  resetForm();
  document.getElementById("task-title").focus();
});

document.querySelectorAll(".scope-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    scope = btn.dataset.scope;
    localStorage.setItem(SCOPE_KEY, scope);
    document.querySelectorAll(".scope-tab").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", b === btn ? "true" : "false");
    });
    render();
  });
});

document.querySelectorAll(".scope-tab").forEach((btn) => {
  if (btn.dataset.scope === scope) {
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
  } else {
    btn.classList.remove("is-active");
    btn.setAttribute("aria-selected", "false");
  }
});

const toggleCompletedBtn = document.getElementById("toggle-completed");
toggleCompletedBtn.addEventListener("click", () => {
  const list = document.getElementById("list-completed");
  const expanded = !list.hidden;
  list.hidden = expanded;
  toggleCompletedBtn.setAttribute("aria-expanded", String(!expanded));
});

const dueInput = document.getElementById("task-due");
const pickDateBtn = document.getElementById("pick-date-btn");
const pickedDateLabel = document.getElementById("picked-date-label");
const clearDateBtn = document.getElementById("clear-date-btn");
const dateChips = document.querySelectorAll(".date-chip[data-offset]");

function updateDateUI() {
  const value = dueInput.value;
  dateChips.forEach((chip) => {
    chip.classList.toggle("is-active", value !== "" && value === offsetISO(Number(chip.dataset.offset)));
  });
  if (!value) {
    pickedDateLabel.textContent = "Choose date…";
    clearDateBtn.hidden = true;
  } else {
    const isPreset = Array.from(dateChips).some((c) => c.classList.contains("is-active"));
    pickedDateLabel.textContent = isPreset
      ? "Choose date…"
      : new Date(value + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    clearDateBtn.hidden = false;
  }
}

dateChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    dueInput.value = offsetISO(Number(chip.dataset.offset));
    updateDateUI();
  });
});

pickDateBtn.addEventListener("click", () => {
  if (typeof dueInput.showPicker === "function") {
    try {
      dueInput.showPicker();
      return;
    } catch (err) {
      /* fall through to focus */
    }
  }
  dueInput.focus();
});

dueInput.addEventListener("change", updateDateUI);

clearDateBtn.addEventListener("click", () => {
  dueInput.value = "";
  updateDateUI();
});

const gmailTemplate = document.getElementById("gmail-item-template");
const gmailList = document.getElementById("gmail-suggestions");
const gmailHint = document.getElementById("gmail-hint");
const gmailConnectBtn = document.getElementById("gmail-connect-btn");
const gmailRefreshBtn = document.getElementById("gmail-refresh-btn");
const dismissedGmailThreads = new Set(
  JSON.parse(localStorage.getItem("lifeDashboard.gmailDismissed.v1") || "[]")
);

function saveDismissed() {
  localStorage.setItem("lifeDashboard.gmailDismissed.v1", JSON.stringify([...dismissedGmailThreads]));
}

function renderGmailItem(item) {
  const node = gmailTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.threadId = item.threadId;

  const badge = node.querySelector(".gmail-reason-badge");
  badge.textContent = item.reason === "starred" ? "⭐ starred" : "awaiting reply";
  if (item.reason === "starred") badge.classList.add("reason-starred");

  node.querySelector(".gmail-subject").textContent = item.subject;
  node.querySelector(".gmail-from").textContent = item.from;
  node.querySelector(".gmail-open-link").href = item.link;

  node.querySelector(".gmail-add-btn").addEventListener("click", (e) => {
    addTask({
      title: item.subject,
      category: "work",
      priority: "medium",
      due: "",
      notes: `From: ${item.from}`,
    });
    e.target.textContent = "Added ✓";
    e.target.classList.add("is-added");
  });

  node.querySelector(".gmail-dismiss-btn").addEventListener("click", () => {
    dismissedGmailThreads.add(item.threadId);
    saveDismissed();
    node.remove();
  });

  return node;
}

async function loadGmailSuggestions() {
  gmailHint.textContent = "Checking Gmail…";
  gmailHint.hidden = false;
  gmailList.innerHTML = "";
  try {
    const res = await fetch("/api/gmail/action-items");
    if (res.status === 401) {
      gmailHint.textContent = "Connect Gmail to see emails that need a reply or are starred.";
      gmailConnectBtn.hidden = false;
      gmailRefreshBtn.hidden = true;
      return;
    }
    if (!res.ok) throw new Error(`status ${res.status}`);
    const { items } = await res.json();
    const visible = items.filter((i) => !dismissedGmailThreads.has(i.threadId));
    gmailConnectBtn.hidden = true;
    gmailRefreshBtn.hidden = false;
    if (visible.length === 0) {
      gmailHint.textContent = "Nothing needs attention right now.";
      gmailHint.hidden = false;
    } else {
      gmailHint.hidden = true;
      visible.forEach((item) => gmailList.appendChild(renderGmailItem(item)));
    }
  } catch (err) {
    console.error("Gmail suggestions failed", err);
    gmailHint.textContent = "Couldn't reach Gmail right now. Try refreshing.";
    gmailHint.hidden = false;
    gmailRefreshBtn.hidden = false;
  }
}

gmailConnectBtn.addEventListener("click", () => {
  window.location.href = "/api/auth/google/start";
});
gmailRefreshBtn.addEventListener("click", loadGmailSuggestions);

fetch("/api/auth/google/status")
  .then((r) => r.json())
  .then(({ connected }) => {
    if (connected) {
      loadGmailSuggestions();
    } else {
      gmailConnectBtn.hidden = false;
    }
  })
  .catch(() => {
    gmailHint.textContent = "Gmail integration isn't set up on this deployment yet.";
  });

const ticktickTemplate = document.getElementById("ticktick-item-template");
const ticktickList = document.getElementById("ticktick-suggestions");
const ticktickHint = document.getElementById("ticktick-hint");
const ticktickConnectBtn = document.getElementById("ticktick-connect-btn");
const ticktickRefreshBtn = document.getElementById("ticktick-refresh-btn");
const dismissedTicktickTasks = new Set(
  JSON.parse(localStorage.getItem("lifeDashboard.ticktickDismissed.v1") || "[]")
);

function saveDismissedTicktick() {
  localStorage.setItem("lifeDashboard.ticktickDismissed.v1", JSON.stringify([...dismissedTicktickTasks]));
}

function renderTicktickItem(item) {
  const node = ticktickTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.taskId = item.id;

  const badge = node.querySelector(".priority-badge");
  badge.textContent = `${PRIORITY_EMOJI[item.priority]} ${item.priority}`;
  badge.classList.add(`priority-${item.priority}`);

  node.querySelector(".tt-title").textContent = item.title;
  node.querySelector(".tt-project").textContent = item.projectName;
  node.querySelector(".gmail-open-link").href = item.link;

  node.querySelector(".gmail-add-btn").addEventListener("click", (e) => {
    addTask({
      title: item.title,
      category: "work",
      priority: item.priority,
      due: item.due || "",
      notes: `From TickTick · ${item.projectName}`,
    });
    e.target.textContent = "Added ✓";
    e.target.classList.add("is-added");
  });

  node.querySelector(".gmail-dismiss-btn").addEventListener("click", () => {
    dismissedTicktickTasks.add(item.id);
    saveDismissedTicktick();
    node.remove();
  });

  return node;
}

async function loadTicktickSuggestions() {
  ticktickHint.textContent = "Checking TickTick…";
  ticktickHint.hidden = false;
  ticktickList.innerHTML = "";
  try {
    const res = await fetch("/api/ticktick/tasks");
    if (res.status === 401) {
      ticktickHint.textContent = "Connect TickTick to see your open tasks here.";
      ticktickConnectBtn.hidden = false;
      ticktickRefreshBtn.hidden = true;
      return;
    }
    if (!res.ok) throw new Error(`status ${res.status}`);
    const { tasks } = await res.json();
    const visible = tasks.filter((t) => !dismissedTicktickTasks.has(t.id));
    ticktickConnectBtn.hidden = true;
    ticktickRefreshBtn.hidden = false;
    if (visible.length === 0) {
      ticktickHint.textContent = "Nothing open in TickTick right now.";
      ticktickHint.hidden = false;
    } else {
      ticktickHint.hidden = true;
      visible.forEach((item) => ticktickList.appendChild(renderTicktickItem(item)));
    }
  } catch (err) {
    console.error("TickTick suggestions failed", err);
    ticktickHint.textContent = "Couldn't reach TickTick right now. Try refreshing.";
    ticktickHint.hidden = false;
    ticktickRefreshBtn.hidden = false;
  }
}

ticktickConnectBtn.addEventListener("click", () => {
  window.location.href = "/api/auth/ticktick/start";
});
ticktickRefreshBtn.addEventListener("click", loadTicktickSuggestions);

fetch("/api/auth/ticktick/status")
  .then((r) => r.json())
  .then(({ connected }) => {
    if (connected) {
      loadTicktickSuggestions();
    } else {
      ticktickConnectBtn.hidden = false;
    }
  })
  .catch(() => {
    ticktickHint.textContent = "TickTick integration isn't set up on this deployment yet.";
  });

const calendarTemplate = document.getElementById("calendar-item-template");
const calendarList = document.getElementById("calendar-events");
const calendarHint = document.getElementById("calendar-hint");
const calendarConnectBtn = document.getElementById("calendar-connect-btn");
const calendarRefreshBtn = document.getElementById("calendar-refresh-btn");

function renderCalendarItem(event) {
  const node = calendarTemplate.content.firstElementChild.cloneNode(true);

  const start = new Date(event.start);
  const dateLabel = formatDue(toISO(start)) || start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timeLabel = event.allDay
    ? "All day"
    : start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  node.querySelector(".cal-time").textContent = `${dateLabel}, ${timeLabel}`;

  node.querySelector(".cal-title").textContent = event.title;

  const locationEl = node.querySelector(".cal-location");
  if (event.location) {
    locationEl.textContent = event.location;
  } else {
    locationEl.remove();
  }

  node.querySelector(".gmail-open-link").href = event.link;

  return node;
}

async function loadCalendarEvents() {
  calendarHint.textContent = "Checking calendar…";
  calendarHint.hidden = false;
  calendarList.innerHTML = "";
  try {
    const res = await fetch("/api/calendar/events");
    if (res.status === 401) {
      calendarHint.textContent = "Connect Google Calendar to see today's and upcoming events here.";
      calendarConnectBtn.hidden = false;
      calendarRefreshBtn.hidden = true;
      return;
    }
    if (!res.ok) throw new Error(`status ${res.status}`);
    const { events } = await res.json();
    calendarConnectBtn.hidden = true;
    calendarRefreshBtn.hidden = false;
    if (events.length === 0) {
      calendarHint.textContent = "Nothing on your calendar for the next 7 days.";
      calendarHint.hidden = false;
    } else {
      calendarHint.hidden = true;
      events.forEach((event) => calendarList.appendChild(renderCalendarItem(event)));
    }
  } catch (err) {
    console.error("Calendar events failed", err);
    calendarHint.textContent = "Couldn't reach Calendar right now. Try refreshing.";
    calendarHint.hidden = false;
    calendarRefreshBtn.hidden = false;
  }
}

calendarConnectBtn.addEventListener("click", () => {
  window.location.href = "/api/auth/gcal/start";
});
calendarRefreshBtn.addEventListener("click", loadCalendarEvents);

fetch("/api/auth/gcal/status")
  .then((r) => r.json())
  .then(({ connected }) => {
    if (connected) {
      loadCalendarEvents();
    } else {
      calendarConnectBtn.hidden = false;
    }
  })
  .catch(() => {
    calendarHint.textContent = "Calendar integration isn't set up on this deployment yet.";
  });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((err) => {
      console.warn("Service worker registration failed", err);
    });
  });
}

render();
