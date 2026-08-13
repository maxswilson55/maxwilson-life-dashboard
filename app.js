const STORAGE_KEY = "lifeDashboard.tasks.v1";
const SCOPE_KEY = "lifeDashboard.scope.v1";

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const PRIORITY_EMOJI = { high: "🔴", medium: "🟡", low: "🔵" };
const CATEGORY_EMOJI = { work: "💼", personal: "🏡" };

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Do not wait to strike till the iron is hot, but make it hot by striking.", author: "William Butler Yeats" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "The best way to predict the future is to create it.", author: "Abraham Lincoln" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "What we think, we become.", author: "Buddha" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did.", author: "Mark Twain" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "Perfection is not attainable, but if we chase perfection we can catch excellence.", author: "Vince Lombardi" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
  { text: "Knowing is not enough; we must apply. Willing is not enough; we must do.", author: "Johann Wolfgang von Goethe" },
  { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Nothing is impossible. The word itself says 'I'm possible'.", author: "Audrey Hepburn" },
  { text: "There is only one way to avoid criticism: do nothing, say nothing, and be nothing.", author: "Aristotle" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra" },
  { text: "People often say that motivation doesn't last. Well, neither does bathing — that's why we recommend it daily.", author: "Zig Ziglar" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Limit your 'always' and your 'nevers'.", author: "Amy Poehler" },
  { text: "Every strike brings me closer to the next home run.", author: "Babe Ruth" },
  { text: "Definiteness of purpose is the starting point of all achievement.", author: "W. Clement Stone" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", author: "Charles R. Swindoll" },
  { text: "Setting goals is the first step in turning the invisible into the visible.", author: "Tony Robbins" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "When one door of happiness closes, another opens.", author: "Helen Keller" },
  { text: "Everything has beauty, but not everyone can see.", author: "Confucius" },
  { text: "How wonderful it is that nobody need wait a single moment before starting to improve the world.", author: "Anne Frank" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "Our lives begin to end the day we become silent about things that matter.", author: "Martin Luther King Jr." },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau" },
  { text: "When I let go of what I am, I become what I might be.", author: "Lao Tzu" },
  { text: "Life shrinks or expands in proportion to one's courage.", author: "Anaïs Nin" },
  { text: "If you look at what you have in life, you'll always have more.", author: "Oprah Winfrey" },
  { text: "If you do what you always did, you will get what you always got.", author: "Anonymous" },
  { text: "Security is mostly a superstition. Life is either a daring adventure or nothing.", author: "Helen Keller" },
  { text: "The only way to get away from the crowd is to lead it.", author: "Bill Bristow" },
  { text: "The most difficult thing is the decision to act, the rest is merely tenacity.", author: "Amelia Earhart" },
];

/** @typedef {{id:string, title:string, category:'work'|'personal', priority:'high'|'medium'|'low', due:string|null, notes:string, done:boolean, createdAt:number, completedAt:number|null, followUpOf:string|null, waitingOn:string|null, waitingSince:number|null}} Task */

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
  syncToServer("tasks", tasks);
}

let tasks = loadTasks();
let scope = localStorage.getItem(SCOPE_KEY) || "all";
let statFilter = null;

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

function isSameMonth(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

const WAITING_ESCALATE_DAYS = 7;

function waitingDays(task) {
  if (!task.waitingOn || !task.waitingSince) return 0;
  return (Date.now() - task.waitingSince) / 86400000;
}

function getChainTasks(task) {
  const ancestors = [];
  let current = task;
  const seenUp = new Set([task.id]);
  while (current.followUpOf) {
    const parent = tasks.find((t) => t.id === current.followUpOf);
    if (!parent || seenUp.has(parent.id)) break;
    ancestors.unshift(parent);
    seenUp.add(parent.id);
    current = parent;
  }

  const descendants = [];
  current = task;
  const seenDown = new Set([task.id]);
  while (true) {
    const child = tasks.find((t) => t.followUpOf === current.id);
    if (!child || seenDown.has(child.id)) break;
    descendants.push(child);
    seenDown.add(child.id);
    current = child;
  }

  return [...ancestors, task, ...descendants];
}

function getChainInfo(task) {
  const chainTasks = getChainTasks(task);
  if (chainTasks.length < 2) return null;
  const root = chainTasks[0];
  const newest = chainTasks[chainTasks.length - 1];
  const ageDays = Math.floor((Date.now() - root.createdAt) / 86400000);
  const stalledDays = Math.floor((Date.now() - newest.createdAt) / 86400000);
  const isStalled = !newest.done && stalledDays >= WAITING_ESCALATE_DAYS;
  return { chainTasks, root, newest, ageDays, steps: chainTasks.length, isStalled };
}

function backlogScore(task) {
  const ageDays = (Date.now() - task.createdAt) / 86400000;
  const priorityWeight = { high: 3, medium: 2, low: 1 }[task.priority] || 1;
  const chainInfo = getChainInfo(task);
  const chainBoost = chainInfo ? (chainInfo.isStalled ? 2 : 1.3) : 1;
  const waitingEscalation = waitingDays(task) >= WAITING_ESCALATE_DAYS ? 3 : 1;
  return ageDays * priorityWeight * chainBoost * waitingEscalation;
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const WEEKDAY_ABBR = { sun: 0, mon: 1, tue: 2, tues: 2, wed: 3, thu: 4, thur: 4, thurs: 4, fri: 5, sat: 6 };
const MONTH_ABBR = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

function nextWeekdayISO(targetDow) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const diff = (targetDow - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return toISO(d);
}

function monthDayISO(monthIdx, day) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let year = now.getFullYear();
  let d = new Date(year, monthIdx, day);
  if (d < now) {
    year += 1;
    d = new Date(year, monthIdx, day);
  }
  return toISO(d);
}

function parseQuickAdd(rawText) {
  let text = rawText;
  let due = null;
  let priority = null;
  let category = null;

  text = text.replace(/\bp1\b/i, () => {
    priority = "high";
    return "";
  });
  text = text.replace(/\bp2\b/i, () => {
    priority = "medium";
    return "";
  });
  text = text.replace(/\bp3\b/i, () => {
    priority = "low";
    return "";
  });

  text = text.replace(/#work\b/i, () => {
    category = "work";
    return "";
  });
  text = text.replace(/#personal\b/i, () => {
    category = "personal";
    return "";
  });

  text = text.replace(/\bin\s+(\d+)\s+days?\b/i, (_m, n) => {
    due = offsetISO(Number(n));
    return "";
  });

  if (!due) {
    text = text.replace(/\btomorrow\b/i, () => {
      due = offsetISO(1);
      return "";
    });
  }
  if (!due) {
    text = text.replace(/\b(today|tonight)\b/i, () => {
      due = offsetISO(0);
      return "";
    });
  }
  if (!due) {
    text = text.replace(
      /\b(sun|sunday|mon|monday|tue|tues|tuesday|wed|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday)\b/i,
      (m) => {
        const key = m.toLowerCase();
        const dow = key in WEEKDAY_ABBR ? WEEKDAY_ABBR[key] : WEEKDAYS.indexOf(key);
        due = nextWeekdayISO(dow);
        return "";
      }
    );
  }
  if (!due) {
    const monthPattern =
      "(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)";
    let m = text.match(new RegExp(`\\b${monthPattern}\\s+(\\d{1,2})\\b`, "i"));
    let monthFirst = true;
    if (!m) {
      m = text.match(new RegExp(`\\b(\\d{1,2})\\s+${monthPattern}\\b`, "i"));
      monthFirst = false;
    }
    if (m) {
      const monthStr = (monthFirst ? m[1] : m[2]).toLowerCase().slice(0, 3);
      const day = Number(monthFirst ? m[2] : m[1]);
      const monthIdx = MONTH_ABBR[monthStr];
      if (monthIdx != null && day >= 1 && day <= 31) {
        due = monthDayISO(monthIdx, day);
        text = text.replace(m[0], "");
      }
    }
  }

  const cleanTitle = text.replace(/\s{2,}/g, " ").trim();
  return { cleanTitle, due, priority, category };
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const LIGATURE_MAP = {
  "ﬀ": "ff",
  "ﬁ": "fi",
  "ﬂ": "fl",
  "ﬃ": "ffi",
  "ﬄ": "ffl",
  "ﬅ": "st",
  "ﬆ": "st",
};

function cleanPastedText(text) {
  return text.replace(/[ﬀ-ﬆ]/g, (ch) => LIGATURE_MAP[ch] || ch);
}

function addTask({ title, category, priority, due, notes, followUpOf }) {
  tasks.push({
    id: makeId(),
    title: cleanPastedText(title.trim()),
    category,
    priority,
    due: due || null,
    notes: cleanPastedText(notes.trim()),
    done: false,
    createdAt: Date.now(),
    completedAt: null,
    followUpOf: followUpOf || null,
    waitingOn: null,
    waitingSince: null,
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

function setWaitingOn(id, waitingOnValue) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  if (waitingOnValue) {
    if (!t.waitingOn) t.waitingSince = Date.now();
    t.waitingOn = waitingOnValue;
  } else {
    t.waitingOn = null;
    t.waitingSince = null;
  }
  saveTasks(tasks);
  render();
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function playCompletionAnimation(node) {
  node.classList.add("is-done", "is-completing");
  const burst = document.createElement("span");
  burst.className = "check-burst";
  burst.textContent = "✓";
  node.appendChild(burst);
}

function handleTaskCheckboxChange(task, node) {
  const completing = !task.done;
  if (!completing || prefersReducedMotion) {
    toggleDone(task.id);
    return;
  }

  task.done = true;
  task.completedAt = Date.now();
  saveTasks(tasks);
  playCompletionAnimation(node);

  setTimeout(() => {
    render();
    showToast(
      `Completed "${task.title}"`,
      () => {
        task.done = false;
        task.completedAt = null;
        saveTasks(tasks);
        render();
      },
      { label: "+ Follow-up", handler: () => startFollowUp(task) }
    );
  }, 650);
}

function updateTask(id, { title, category, priority, due, notes }) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.title = cleanPastedText(title.trim());
  t.category = category;
  t.priority = priority;
  t.due = due || null;
  t.notes = cleanPastedText(notes.trim());
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
const toastActionBtn = document.getElementById("toast-action-btn");
let toastTimeoutId = null;
let toastUndoHandler = null;
let toastActionHandler = null;

function showToast(message, onUndo, action) {
  clearTimeout(toastTimeoutId);
  toastMessageEl.textContent = message;
  toastUndoHandler = onUndo;
  toastActionHandler = action ? action.handler : null;
  toastActionBtn.textContent = action ? action.label : "";
  toastActionBtn.hidden = !action;
  toastUndoBtn.hidden = !onUndo;
  toastEl.hidden = false;
  toastTimeoutId = setTimeout(() => {
    toastEl.hidden = true;
    toastUndoHandler = null;
    toastActionHandler = null;
  }, 5000);
}

toastUndoBtn.addEventListener("click", () => {
  clearTimeout(toastTimeoutId);
  toastEl.hidden = true;
  if (toastUndoHandler) toastUndoHandler();
  toastUndoHandler = null;
  toastActionHandler = null;
});

toastActionBtn.addEventListener("click", () => {
  clearTimeout(toastTimeoutId);
  toastEl.hidden = true;
  if (toastActionHandler) toastActionHandler();
  toastUndoHandler = null;
  toastActionHandler = null;
});

let syncFailureToastAt = 0;

async function syncToServer(key, value) {
  try {
    const res = await fetch(`/api/sync/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
  } catch (err) {
    console.error(`Sync to server failed for "${key}"`, err);
    const now = Date.now();
    if (now - syncFailureToastAt > 4000) {
      syncFailureToastAt = now;
      showToast("⚠️ Couldn't sync — saved on this device only. Check your connection.");
    }
  }
}

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
  checkbox.addEventListener("change", () => handleTaskCheckboxChange(task, node));

  const priorityBadge = node.querySelector(".priority-badge");
  if (task.priority === "medium") {
    priorityBadge.remove();
  } else {
    priorityBadge.textContent = `${PRIORITY_EMOJI[task.priority]} ${task.priority}`;
    priorityBadge.classList.add(`priority-${task.priority}`);
  }

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

  const followUpEl = node.querySelector(".task-followup-of");
  const parentTask = task.followUpOf ? tasks.find((t) => t.id === task.followUpOf) : null;
  if (parentTask) {
    followUpEl.textContent = `↳ Follow-up to "${parentTask.title}"`;
  } else {
    followUpEl.remove();
  }

  const waitingBadge = node.querySelector(".task-waiting-badge");
  if (task.waitingOn) {
    const days = Math.floor(waitingDays(task));
    waitingBadge.textContent = `⏳ Waiting on ${task.waitingOn} · ${days}d`;
    waitingBadge.classList.toggle("is-stale", days >= WAITING_ESCALATE_DAYS);
  } else {
    waitingBadge.remove();
  }

  const waitingBtn = node.querySelector(".task-waiting-btn");
  waitingBtn.title = task.waitingOn ? "Update or clear waiting status" : "Mark as waiting on someone";
  waitingBtn.setAttribute("aria-label", waitingBtn.title);
  waitingBtn.addEventListener("click", () => {
    const input = window.prompt(
      task.waitingOn
        ? "Update who/what you're waiting on (leave blank to clear):"
        : "Who or what are you waiting on?",
      task.waitingOn || ""
    );
    if (input === null) return;
    setWaitingOn(task.id, input.trim() || null);
  });

  const chainBadge = node.querySelector(".task-chain-badge");
  const chainThread = node.querySelector(".task-chain-thread");
  const chainInfo = getChainInfo(task);
  if (chainInfo) {
    chainBadge.textContent = `🔗 ${chainInfo.steps} steps · started ${chainInfo.ageDays}d ago`;
    chainBadge.classList.toggle("is-stalled", chainInfo.isStalled);
    chainBadge.addEventListener("click", () => {
      const wasHidden = chainThread.hidden;
      chainThread.hidden = !wasHidden;
      if (wasHidden) {
        chainThread.innerHTML = "";
        chainInfo.chainTasks.forEach((ct) => {
          const li = document.createElement("li");
          const created = new Date(ct.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
          const status = ct.done
            ? `done ${new Date(ct.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
            : "open";
          li.textContent = `${ct.title} — ${created} (${status})`;
          if (ct.id === task.id) li.classList.add("is-current");
          chainThread.appendChild(li);
        });
      }
    });
  } else {
    chainBadge.remove();
    chainThread.remove();
  }

  node.querySelector(".task-followup").addEventListener("click", () => startFollowUp(task));
  node.querySelector(".task-edit").addEventListener("click", () => enterEditMode(task));

  node.querySelector(".task-delete").addEventListener("click", () => {
    requestDeleteTask(task.id);
  });

  return node;
}

const COLLAPSE_AT = 6;
const expandedSections = new Set();

function renderList(listEl, hintEl, list, sectionKey) {
  listEl.innerHTML = "";
  const isExpanded = !sectionKey || expandedSections.has(sectionKey);
  const visibleList = isExpanded ? list : list.slice(0, COLLAPSE_AT);
  visibleList.forEach((t) => listEl.appendChild(renderTaskItem(t)));
  if (hintEl) hintEl.hidden = list.length > 0;

  const existingToggle = listEl.parentElement.querySelector(`.section-toggle[data-section="${sectionKey}"]`);
  if (existingToggle) existingToggle.remove();

  if (sectionKey && list.length > COLLAPSE_AT) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "link-btn section-toggle";
    btn.dataset.section = sectionKey;
    btn.textContent = isExpanded ? "Show less" : `Show ${list.length - COLLAPSE_AT} more`;
    btn.addEventListener("click", () => {
      if (isExpanded) expandedSections.delete(sectionKey);
      else expandedSections.add(sectionKey);
      render();
    });
    listEl.after(btn);
  }
}

function render() {
  const visible = tasks.filter(inScope);
  const active = visible.filter((t) => !t.done);
  const today = todayISO();

  let todayAndOverdue = sortTasks(active.filter((t) => t.due && t.due <= today));
  let upcoming = sortTasks(active.filter((t) => t.due && t.due > today));
  let someday = sortTasks(active.filter((t) => !t.due));
  let completed = visible
    .filter((t) => t.done)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  if (statFilter === "dueToday") {
    upcoming = [];
    someday = [];
  } else if (statFilter === "high") {
    todayAndOverdue = todayAndOverdue.filter((t) => t.priority === "high");
    upcoming = upcoming.filter((t) => t.priority === "high");
    someday = someday.filter((t) => t.priority === "high");
  } else if (statFilter === "doneMonth") {
    completed = completed.filter((t) => t.completedAt && isSameMonth(t.completedAt));
  }

  const rankedBacklog = someday.slice().sort((a, b) => backlogScore(b) - backlogScore(a));

  renderTodayColumn(todayAndOverdue, rankedBacklog);
  renderList(document.getElementById("list-upcoming"), document.getElementById("hint-upcoming"), upcoming, "upcoming");
  renderList(document.getElementById("list-someday"), document.getElementById("hint-someday"), someday, "someday");
  renderList(document.getElementById("list-completed"), null, completed);

  document.getElementById("completed-count").textContent = completed.length;

  if (statFilter === "doneMonth") {
    const completedList = document.getElementById("list-completed");
    completedList.hidden = false;
    toggleCompletedBtn.setAttribute("aria-expanded", "true");
  }

  const waitingTasks = active
    .filter((t) => t.waitingOn)
    .sort((a, b) => (a.waitingSince || 0) - (b.waitingSince || 0));
  renderWaitingSection(waitingTasks);

  renderStats(active, todayAndOverdue, completed);
  renderHero(todayAndOverdue, upcoming, rankedBacklog);
  renderHeatmap();
}

function renderWaitingSection(waitingTasks) {
  const listEl = document.getElementById("waiting-list");
  const hintEl = document.getElementById("waiting-hint");
  listEl.innerHTML = "";
  if (waitingTasks.length === 0) {
    hintEl.hidden = false;
    return;
  }
  hintEl.hidden = true;
  waitingTasks.forEach((t) => listEl.appendChild(renderTaskItem(t)));
}

function renderTodayColumn(todayAndOverdue, rankedBacklog) {
  const listEl = document.getElementById("list-today");
  const hintEl = document.getElementById("hint-today");
  const fallbackNoteEl = document.getElementById("today-fallback-note");

  if (todayAndOverdue.length > 0) {
    fallbackNoteEl.hidden = true;
    renderList(listEl, hintEl, todayAndOverdue, "today");
    return;
  }

  const suggestions = rankedBacklog.slice(0, 3);

  if (suggestions.length === 0) {
    fallbackNoteEl.hidden = true;
    renderList(listEl, hintEl, [], "today");
    return;
  }

  fallbackNoteEl.hidden = false;
  hintEl.hidden = true;
  listEl.innerHTML = "";
  suggestions.forEach((t) => listEl.appendChild(renderTaskItem(t)));
  const existingToggle = listEl.parentElement.querySelector('.section-toggle[data-section="today"]');
  if (existingToggle) existingToggle.remove();
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return { text: "Still up, Max", emoji: "🌙" };
  if (hour < 12) return { text: "Good morning, Max", emoji: "☀️" };
  if (hour < 17) return { text: "Good afternoon, Max", emoji: "🌤️" };
  if (hour < 21) return { text: "Good evening, Max", emoji: "🌆" };
  return { text: "Good evening, Max", emoji: "🌙" };
}

function renderHeroTaskRow(task) {
  const wrap = document.createElement("div");
  wrap.className = "hero-next-task";

  const label = document.createElement("label");
  label.className = "task-check";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.addEventListener("change", () => handleTaskCheckboxChange(task, wrap));
  const checkmark = document.createElement("span");
  checkmark.className = "checkmark";
  label.appendChild(checkbox);
  label.appendChild(checkmark);
  wrap.appendChild(label);

  const priorityBadge = document.createElement("span");
  priorityBadge.className = `priority-badge priority-${task.priority}`;
  priorityBadge.textContent = `${PRIORITY_EMOJI[task.priority]} ${task.priority}`;
  wrap.appendChild(priorityBadge);

  const title = document.createElement("span");
  title.className = "task-title";
  title.style.flex = "1";
  title.textContent = task.title;
  wrap.appendChild(title);

  if (task.due) {
    const due = document.createElement("span");
    due.className = "task-due";
    due.textContent = formatDue(task.due);
    if (task.due < todayISO() && !task.done) due.classList.add("is-overdue");
    wrap.appendChild(due);
  }

  return wrap;
}

function renderHero(todayAndOverdue, upcoming, rankedBacklog) {
  const greeting = getGreeting();
  document.getElementById("hero-greeting").textContent = `${greeting.emoji} ${greeting.text}`;
  document.getElementById("hero-date").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const nextTask = todayAndOverdue[0] || upcoming[0] || rankedBacklog[0] || null;
  const nextActionEl = document.getElementById("hero-next-action");
  nextActionEl.innerHTML = "";

  const label = document.createElement("div");
  label.className = "hero-next-label";
  label.textContent = "Next up";
  nextActionEl.appendChild(label);

  if (!nextTask) {
    const empty = document.createElement("p");
    empty.className = "hero-next-empty";
    empty.textContent = "Nothing on your plate — you're all clear.";
    nextActionEl.appendChild(empty);
  } else {
    nextActionEl.appendChild(renderHeroTaskRow(nextTask));
  }
}

function heatLevel(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

function renderHeatmap() {
  const weeks = 6;
  const totalDays = weeks * 7;
  const counts = {};
  tasks.forEach((t) => {
    if (t.done && t.completedAt) {
      const iso = toISO(new Date(t.completedAt));
      counts[iso] = (counts[iso] || 0) + 1;
    }
  });

  const grid = document.getElementById("heatmap-grid");
  grid.innerHTML = "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = toISO(d);
    const count = counts[iso] || 0;
    const cell = document.createElement("div");
    cell.className = "heat-cell";
    cell.dataset.level = heatLevel(count);
    cell.title = `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}: ${count} completed`;
    grid.appendChild(cell);
  }
}

function renderStats(active, todayAndOverdue, completed) {
  const highCount = active.filter((t) => t.priority === "high").length;
  const doneThisMonthCount = completed.filter((t) => t.completedAt && isSameMonth(t.completedAt)).length;
  const stats = [
    { key: null, label: `${active.length} open`, cls: "" },
    { key: "dueToday", label: `${todayAndOverdue.length} due today/overdue`, cls: "priority-high" },
    { key: "high", label: `${highCount} high priority`, cls: "priority-high" },
    { key: "doneMonth", label: `${doneThisMonthCount} done this month`, cls: "priority-low" },
  ];
  const strip = document.getElementById("stats-strip");
  strip.innerHTML = "";
  stats.forEach((s) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = `stat-pill ${s.cls}`;
    pill.classList.toggle("is-active", s.key !== null && statFilter === s.key);
    pill.textContent = s.label;
    pill.addEventListener("click", () => {
      statFilter = statFilter === s.key ? null : s.key;
      render();
    });
    strip.appendChild(pill);
  });

  if (statFilter) {
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "link-btn stat-clear-btn";
    clearBtn.textContent = "✕ Clear filter";
    clearBtn.addEventListener("click", () => {
      statFilter = null;
      render();
    });
    strip.appendChild(clearBtn);
  }
}

let editingTaskId = null;
let followUpOfId = null;
const taskSubmitBtn = document.getElementById("task-submit-btn");
const taskCancelEditBtn = document.getElementById("task-cancel-edit-btn");
const followupBanner = document.getElementById("followup-banner");
const followupParentTitle = document.getElementById("followup-parent-title");
const followupCancelBtn = document.getElementById("followup-cancel-btn");
const advancedToggleBtn = document.getElementById("advanced-toggle-btn");
const quickAddAdvanced = document.getElementById("quick-add-advanced");
const quickAddPreview = document.getElementById("quick-add-preview");

function setAdvancedOpen(open) {
  quickAddAdvanced.hidden = !open;
  advancedToggleBtn.textContent = open ? "▾ Fewer options" : "▸ More options";
  advancedToggleBtn.setAttribute("aria-expanded", String(open));
}

advancedToggleBtn.addEventListener("click", () => {
  setAdvancedOpen(quickAddAdvanced.hidden);
});

function updateQuickAddPreview() {
  const raw = document.getElementById("task-title").value;
  const parsed = parseQuickAdd(raw);
  const bits = [];
  if (parsed.due) bits.push(`📅 ${formatDue(parsed.due) || parsed.due}`);
  if (parsed.priority) bits.push(`${PRIORITY_EMOJI[parsed.priority]} ${parsed.priority}`);
  if (parsed.category) bits.push(`${CATEGORY_EMOJI[parsed.category]} ${parsed.category}`);
  if (bits.length === 0) {
    quickAddPreview.hidden = true;
    quickAddPreview.textContent = "";
  } else {
    quickAddPreview.hidden = false;
    quickAddPreview.textContent = bits.join(" · ");
  }
}

document.getElementById("task-title").addEventListener("input", updateQuickAddPreview);

function resetForm() {
  document.getElementById("task-form").reset();
  document.getElementById("task-priority").value = "medium";
  updateDateUI();
  setAdvancedOpen(false);
  updateQuickAddPreview();
}

function enterEditMode(task) {
  exitFollowUpMode();
  editingTaskId = task.id;
  document.getElementById("task-title").value = task.title;
  document.getElementById("task-category").value = task.category;
  document.getElementById("task-priority").value = task.priority;
  document.getElementById("task-notes").value = task.notes || "";
  dueInput.value = task.due || "";
  updateDateUI();
  setAdvancedOpen(true);
  updateQuickAddPreview();
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

function startFollowUp(task) {
  exitEditMode();
  followUpOfId = task.id;
  followupParentTitle.textContent = task.title;
  followupBanner.hidden = false;
  document.getElementById("task-category").value = task.category;
  document.querySelector(".quick-add").scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("task-title").focus();
}

function exitFollowUpMode() {
  followUpOfId = null;
  followupBanner.hidden = true;
}

followupCancelBtn.addEventListener("click", exitFollowUpMode);

document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const rawTitle = document.getElementById("task-title").value;
  if (!rawTitle.trim()) return;
  const parsed = parseQuickAdd(rawTitle);
  const payload = {
    title: parsed.cleanTitle || rawTitle,
    category: parsed.category || document.getElementById("task-category").value,
    priority: parsed.priority || document.getElementById("task-priority").value,
    due: parsed.due || document.getElementById("task-due").value,
    notes: document.getElementById("task-notes").value,
  };
  if (editingTaskId) {
    updateTask(editingTaskId, payload);
    editingTaskId = null;
    taskSubmitBtn.textContent = "Add";
    taskCancelEditBtn.hidden = true;
  } else if (followUpOfId) {
    addTask({ ...payload, followUpOf: followUpOfId });
    exitFollowUpMode();
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

const connectorsBar = document.getElementById("connectors-bar");
const connectorSections = {
  calendar: document.getElementById("calendar-section"),
  ticktick: document.getElementById("ticktick-section"),
  gmail: document.getElementById("gmail-section"),
};
const connectorMiniBtns = {
  calendar: document.getElementById("calendar-connect-mini"),
  ticktick: document.getElementById("ticktick-connect-mini"),
  gmail: document.getElementById("gmail-connect-mini"),
};
const connectorStartUrls = {
  calendar: "/api/auth/gcal/start",
  ticktick: "/api/auth/ticktick/start",
  gmail: "/api/auth/google/start",
};

Object.entries(connectorMiniBtns).forEach(([service, btn]) => {
  btn.addEventListener("click", () => {
    window.location.href = connectorStartUrls[service];
  });
});

function setConnectorState(service, connected) {
  connectorSections[service].hidden = !connected;
  connectorMiniBtns[service].hidden = connected;
  const anyDisconnected = Object.values(connectorMiniBtns).some((btn) => !btn.hidden);
  connectorsBar.hidden = !anyDisconnected;
}

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
      gmailRefreshBtn.hidden = true;
      setConnectorState("gmail", false);
      return;
    }
    if (!res.ok) throw new Error(`status ${res.status}`);
    const { items } = await res.json();
    const visible = items.filter((i) => !dismissedGmailThreads.has(i.threadId));
    gmailRefreshBtn.hidden = false;
    setConnectorState("gmail", true);
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
      setConnectorState("gmail", false);
    }
  })
  .catch(() => {
    gmailHint.textContent = "Gmail integration isn't set up on this deployment yet.";
    setConnectorState("gmail", false);
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
      ticktickRefreshBtn.hidden = true;
      setConnectorState("ticktick", false);
      return;
    }
    if (!res.ok) throw new Error(`status ${res.status}`);
    const { tasks } = await res.json();
    const visible = tasks.filter((t) => !dismissedTicktickTasks.has(t.id));
    ticktickRefreshBtn.hidden = false;
    setConnectorState("ticktick", true);
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
      setConnectorState("ticktick", false);
    }
  })
  .catch(() => {
    ticktickHint.textContent = "TickTick integration isn't set up on this deployment yet.";
    setConnectorState("ticktick", false);
  });

const calendarTemplate = document.getElementById("calendar-item-template");
const calendarList = document.getElementById("calendar-events");
const calendarHint = document.getElementById("calendar-hint");
const calendarConnectBtn = document.getElementById("calendar-connect-btn");
const calendarRefreshBtn = document.getElementById("calendar-refresh-btn");

const CAL_PALETTE = [
  { fg: "#8b5cf6", bg: "rgba(139, 92, 246, 0.16)" },
  { fg: "#66a6ff", bg: "rgba(102, 166, 255, 0.16)" },
  { fg: "#52d39b", bg: "rgba(82, 211, 155, 0.16)" },
  { fg: "#f3b95f", bg: "rgba(243, 185, 95, 0.16)" },
  { fg: "#f472b6", bg: "rgba(244, 114, 182, 0.16)" },
  { fg: "#2dd4bf", bg: "rgba(45, 212, 191, 0.16)" },
];

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function eventDateISO(event) {
  return event.allDay ? event.start : toISO(new Date(event.start));
}

function groupEventsByDay(events) {
  const groups = [];
  let currentKey = null;
  let currentGroup = null;
  events.forEach((event) => {
    const dateISO = eventDateISO(event);
    if (dateISO !== currentKey) {
      currentKey = dateISO;
      currentGroup = { label: formatDue(dateISO) || dateISO, events: [] };
      groups.push(currentGroup);
    }
    currentGroup.events.push(event);
  });
  return groups;
}

function renderCalendarItem(event) {
  const node = calendarTemplate.content.firstElementChild.cloneNode(true);

  const color = CAL_PALETTE[hashString(event.id) % CAL_PALETTE.length];
  node.style.setProperty("--cal-accent", color.fg);
  node.style.setProperty("--cal-accent-bg", color.bg);

  const timeLabel = event.allDay
    ? "All day"
    : new Date(event.start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  node.querySelector(".cal-time").textContent = timeLabel;

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

function renderCalendarDayHeader(label) {
  const li = document.createElement("li");
  li.className = "cal-day-header";
  li.textContent = label;
  return li;
}

async function loadCalendarEvents() {
  calendarHint.textContent = "Checking calendar…";
  calendarHint.hidden = false;
  calendarList.innerHTML = "";
  try {
    const res = await fetch("/api/calendar/events");
    if (res.status === 401) {
      calendarHint.textContent = "Connect Google Calendar to see today's and upcoming events here.";
      calendarRefreshBtn.hidden = true;
      setConnectorState("calendar", false);
      return;
    }
    if (!res.ok) throw new Error(`status ${res.status}`);
    const { events } = await res.json();
    calendarRefreshBtn.hidden = false;
    setConnectorState("calendar", true);
    if (events.length === 0) {
      calendarHint.textContent = "Nothing on your calendar for the next 7 days.";
      calendarHint.hidden = false;
    } else {
      calendarHint.hidden = true;
      groupEventsByDay(events).forEach((group) => {
        calendarList.appendChild(renderCalendarDayHeader(group.label));
        group.events.forEach((event) => calendarList.appendChild(renderCalendarItem(event)));
      });
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
      setConnectorState("calendar", false);
    }
  })
  .catch(() => {
    calendarHint.textContent = "Calendar integration isn't set up on this deployment yet.";
    setConnectorState("calendar", false);
  });

const STOCKS_KEY = "lifeDashboard.stocks.v1";
const DEFAULT_TICKERS = [
  "GOOG",
  "IE0002PG6CA6.SG",
  "BTC-USD",
  "HYPE32196-USD",
  "MSFT",
  "VUSDL.XC",
  "TSLA",
  "TSM",
  "SGLD.L",
  "EQQQ.MI",
];

function loadTickers() {
  const raw = localStorage.getItem(STOCKS_KEY);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(STOCKS_KEY, JSON.stringify(DEFAULT_TICKERS));
  return DEFAULT_TICKERS.slice();
}

function saveTickers(tickers) {
  localStorage.setItem(STOCKS_KEY, JSON.stringify(tickers));
  syncToServer("stocks", tickers);
}

const stockTemplate = document.getElementById("stock-item-template");
const stockList = document.getElementById("stock-items");
const stocksHint = document.getElementById("stocks-hint");
const stocksRefreshBtn = document.getElementById("stocks-refresh-btn");
const stockAddForm = document.getElementById("stock-add-form");
const stockSymbolInput = document.getElementById("stock-symbol-input");

function renderStockItem(quote) {
  const node = stockTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector(".stock-symbol").textContent = quote.symbol;

  const priceEl = node.querySelector(".stock-price");
  const changeEl = node.querySelector(".stock-change");

  if (quote.error) {
    priceEl.textContent = "—";
    changeEl.remove();
  } else {
    priceEl.textContent = quote.price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (quote.changePercent != null) {
      const sign = quote.changePercent >= 0 ? "+" : "";
      changeEl.textContent = `${sign}${quote.changePercent.toFixed(2)}%`;
      changeEl.classList.add(quote.changePercent > 0 ? "is-up" : quote.changePercent < 0 ? "is-down" : "is-flat");
    } else {
      changeEl.remove();
    }
  }

  node.querySelector(".stock-remove").addEventListener("click", () => {
    const tickers = loadTickers().filter((s) => s !== quote.symbol);
    saveTickers(tickers);
    node.remove();
    if (tickers.length === 0) {
      stocksHint.textContent = "Add a ticker to start tracking.";
      stocksHint.hidden = false;
    }
    showToast(`Removed "${quote.symbol}"`, () => {
      const restored = loadTickers();
      if (!restored.includes(quote.symbol)) {
        restored.push(quote.symbol);
        saveTickers(restored);
      }
      loadStockQuotes();
    });
  });

  return node;
}

async function loadStockQuotes() {
  const tickers = loadTickers();
  if (tickers.length === 0) {
    stockList.innerHTML = "";
    stocksHint.textContent = "Add a ticker to start tracking.";
    stocksHint.hidden = false;
    return;
  }
  stocksHint.textContent = "Loading quotes…";
  stocksHint.hidden = false;
  stockList.innerHTML = "";
  try {
    const res = await fetch(`/api/stocks/quotes?symbols=${encodeURIComponent(tickers.join(","))}`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const { quotes } = await res.json();
    stocksHint.hidden = true;
    quotes.forEach((quote) => stockList.appendChild(renderStockItem(quote)));
  } catch (err) {
    console.error("Stock quotes failed", err);
    stocksHint.textContent = "Couldn't load quotes right now. Try refreshing.";
    stocksHint.hidden = false;
  }
}

stockAddForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const symbol = stockSymbolInput.value.trim().toUpperCase();
  if (!symbol) return;
  const tickers = loadTickers();
  if (!tickers.includes(symbol)) {
    tickers.push(symbol);
    saveTickers(tickers);
    loadStockQuotes();
  }
  stockSymbolInput.value = "";
});

stocksRefreshBtn.addEventListener("click", loadStockQuotes);
loadStockQuotes();

const newsTemplate = document.getElementById("news-item-template");
const newsList = document.getElementById("news-items");
const newsHint = document.getElementById("news-hint");
const newsRefreshBtn = document.getElementById("news-refresh-btn");

function formatRelativeTime(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function renderNewsItem(item) {
  const node = newsTemplate.content.firstElementChild.cloneNode(true);

  const badge = node.querySelector(".news-source-badge");
  badge.textContent = item.source;
  badge.classList.add(item.source === "FT" ? "source-ft" : "source-cnbc");

  node.querySelector(".news-title").textContent = item.title;
  node.querySelector(".news-time").textContent = formatRelativeTime(item.pubDate);
  node.querySelector(".gmail-open-link").href = item.link;

  return node;
}

async function loadNews() {
  newsHint.textContent = "Loading headlines…";
  newsHint.hidden = false;
  newsList.innerHTML = "";
  try {
    const res = await fetch("/api/news/headlines");
    if (!res.ok) throw new Error(`status ${res.status}`);
    const { items } = await res.json();
    const topItems = items.slice(0, 5);
    if (topItems.length === 0) {
      newsHint.textContent = "No headlines right now. Try refreshing.";
      newsHint.hidden = false;
    } else {
      newsHint.hidden = true;
      topItems.forEach((item) => newsList.appendChild(renderNewsItem(item)));
    }
  } catch (err) {
    console.error("News fetch failed", err);
    newsHint.textContent = "Couldn't load business news right now. Try refreshing.";
    newsHint.hidden = false;
  }
}

newsRefreshBtn.addEventListener("click", loadNews);
loadNews();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((err) => {
      console.warn("Service worker registration failed", err);
    });
  });
}

function updateTopbarHeightVar() {
  const topbar = document.querySelector(".topbar");
  document.documentElement.style.setProperty("--topbar-height", `${topbar.offsetHeight}px`);
}
updateTopbarHeightVar();
window.addEventListener("resize", updateTopbarHeightVar);

const JOURNAL_KEY = "lifeDashboard.journal.v1";

function loadJournal() {
  try {
    return JSON.parse(localStorage.getItem(JOURNAL_KEY) || "{}");
  } catch (err) {
    return {};
  }
}

function saveJournalEntry(dateISO, entry) {
  const all = loadJournal();
  all[dateISO] = entry;
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(all));
  syncToServer("journal", all);
}

const journalInput = document.getElementById("journal-input");
const journalSubmitBtn = document.getElementById("journal-submit-btn");
const journalStatus = document.getElementById("journal-status");
const journalResult = document.getElementById("journal-result");
const journalMoodBadge = document.getElementById("journal-mood-badge");
const journalSuggestedTasks = document.getElementById("journal-suggested-tasks");
const journalTaskTemplate = document.getElementById("journal-task-item-template");
const journalMoodHistoryEl = document.getElementById("journal-mood-history");
const journalHistoryHeader = document.getElementById("journal-history-header");

function renderJournalTaskSuggestion(taskTitle) {
  const node = journalTaskTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector(".journal-task-title").textContent = taskTitle;
  node.querySelector(".gmail-add-btn").addEventListener("click", (e) => {
    addTask({
      title: taskTitle,
      category: "personal",
      priority: "medium",
      due: "",
      notes: "From daily check-in",
    });
    e.target.textContent = "Added ✓";
    e.target.classList.add("is-added");
  });
  return node;
}

function renderMoodHistory() {
  const all = loadJournal();
  const days = 14;
  journalMoodHistoryEl.innerHTML = "";
  let hasAny = false;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = toISO(d);
    const entry = all[iso];
    const chip = document.createElement("span");
    chip.className = "mood-chip";
    if (entry) {
      hasAny = true;
      chip.textContent = entry.mood.emoji;
      chip.title = `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}: ${entry.mood.label} (${entry.mood.score}/10)`;
    } else {
      chip.textContent = "·";
      chip.classList.add("mood-chip-empty");
      chip.title = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
    journalMoodHistoryEl.appendChild(chip);
  }
  journalHistoryHeader.hidden = !hasAny;
}

async function submitJournalEntry() {
  const text = journalInput.value.trim();
  if (!text) return;
  journalSubmitBtn.disabled = true;
  journalStatus.textContent = "Thinking…";
  try {
    const res = await fetch("/api/journal/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const { mood, tasks } = await res.json();

    saveJournalEntry(todayISO(), { text, mood, createdAt: Date.now() });

    journalMoodBadge.textContent = `${mood.emoji} ${mood.label} (${mood.score}/10)`;
    journalSuggestedTasks.innerHTML = "";
    (tasks || []).forEach((t) => journalSuggestedTasks.appendChild(renderJournalTaskSuggestion(t.title)));
    journalResult.hidden = false;
    journalStatus.textContent = "";
    renderMoodHistory();
  } catch (err) {
    console.error("Journal analyze failed", err);
    journalStatus.textContent = "Couldn't analyze that right now — try again.";
  } finally {
    journalSubmitBtn.disabled = false;
  }
}

journalSubmitBtn.addEventListener("click", submitJournalEntry);

function initJournal() {
  const all = loadJournal();
  const todayEntry = all[todayISO()];
  if (todayEntry) {
    journalInput.value = todayEntry.text;
    journalMoodBadge.textContent = `${todayEntry.mood.emoji} ${todayEntry.mood.label} (${todayEntry.mood.score}/10)`;
    journalResult.hidden = false;
  }
  renderMoodHistory();
}
initJournal();

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const pushEnableBtn = document.getElementById("push-enable-btn");
const pushStatusEl = document.getElementById("push-status");

async function initPushUI() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    pushEnableBtn.hidden = true;
    return;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      pushEnableBtn.textContent = "🔔 Daily reminder on";
      pushEnableBtn.disabled = true;
    }
  } catch (err) {
    console.warn("Push init check failed", err);
  }
}

async function enablePush() {
  pushStatusEl.textContent = "Enabling…";
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      pushStatusEl.textContent = "Notification permission wasn't granted.";
      return;
    }
    const keyRes = await fetch("/api/push/vapid-public-key");
    if (!keyRes.ok) throw new Error(`status ${keyRes.status}`);
    const { publicKey } = await keyRes.json();
    if (!publicKey) throw new Error("no_public_key");

    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const subRes = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
    if (!subRes.ok) throw new Error(`status ${subRes.status}`);

    pushEnableBtn.textContent = "🔔 Daily reminder on";
    pushEnableBtn.disabled = true;
    pushStatusEl.textContent = "You'll get a check-in reminder at 9pm daily.";
  } catch (err) {
    console.error("Enable push failed", err);
    pushStatusEl.textContent = "Couldn't enable notifications right now.";
  }
}

pushEnableBtn.addEventListener("click", enablePush);
initPushUI();

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

function renderQuote() {
  const quote = QUOTES[dayOfYear(new Date()) % QUOTES.length];
  const block = document.getElementById("quote-block");
  block.innerHTML = "";
  const p = document.createElement("p");
  p.className = "quote-text";
  p.textContent = `"${quote.text}"`;
  const cite = document.createElement("cite");
  cite.className = "quote-author";
  cite.textContent = `— ${quote.author}`;
  block.appendChild(p);
  block.appendChild(cite);
}

async function loadOnThisDay() {
  const historyEl = document.getElementById("history-block");
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    const events = data.events || [];
    if (events.length === 0) {
      historyEl.textContent = "No history fact available today.";
      return;
    }
    const event = events[dayOfYear(now) % events.length];
    const page = event.pages && event.pages[0];
    const link = page && page.content_urls && page.content_urls.desktop ? page.content_urls.desktop.page : null;

    historyEl.innerHTML = "";
    const yearSpan = document.createElement("span");
    yearSpan.className = "history-year";
    yearSpan.textContent = event.year;
    const textSpan = document.createElement("span");
    textSpan.className = "history-text";
    textSpan.textContent = ` ${event.text}`;
    historyEl.appendChild(yearSpan);
    historyEl.appendChild(textSpan);
    if (link) {
      historyEl.appendChild(document.createElement("br"));
      const a = document.createElement("a");
      a.href = link;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "gmail-open-link";
      a.textContent = "Read more";
      historyEl.appendChild(a);
    }
  } catch (err) {
    console.error("On this day fetch failed", err);
    historyEl.textContent = "Couldn't load today's history fact.";
  }
}

renderQuote();
loadOnThisDay();

const IDEAS_KEY = "lifeDashboard.ideas.v1";
const IDEA_CATEGORY_LABELS = { "life-hack": "Life Hack", "business-idea": "Business Idea", other: "Other" };

function loadIdeas() {
  try {
    return JSON.parse(localStorage.getItem(IDEAS_KEY) || "[]");
  } catch (err) {
    return [];
  }
}

function saveIdeasList(ideas) {
  localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
  syncToServer("ideas", ideas);
}

function detectIdeaSource(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("instagram.com")) return "Instagram";
    if (host.includes("tiktok.com")) return "TikTok";
    return host;
  } catch (err) {
    return "Link";
  }
}

const ideaTemplate = document.getElementById("idea-item-template");
const ideaUrlInput = document.getElementById("idea-url-input");
const ideaNoteInput = document.getElementById("idea-note-input");
const ideaSubmitBtn = document.getElementById("idea-submit-btn");
const ideaStatus = document.getElementById("idea-status");
const ideaList = document.getElementById("idea-list");
const ideaHint = document.getElementById("idea-hint");

function renderIdeaItem(idea) {
  const node = ideaTemplate.content.firstElementChild.cloneNode(true);

  const badge = node.querySelector(".idea-category-badge");
  badge.textContent = IDEA_CATEGORY_LABELS[idea.category] || "Other";
  badge.classList.add(`idea-cat-${idea.category || "other"}`);

  node.querySelector(".idea-title").textContent = idea.title || idea.note || idea.url;
  node.querySelector(".idea-source").textContent = idea.source;

  const noteEl = node.querySelector(".idea-note");
  if (idea.title && idea.note) {
    noteEl.textContent = idea.note;
  } else {
    noteEl.remove();
  }

  node.querySelector(".idea-link").href = idea.url;

  node.querySelector(".idea-delete").addEventListener("click", () => {
    saveIdeasList(loadIdeas().filter((i) => i.id !== idea.id));
    node.remove();
    if (loadIdeas().length === 0) ideaHint.hidden = false;
  });

  return node;
}

function renderIdeas() {
  const ideas = loadIdeas();
  ideaList.innerHTML = "";
  if (ideas.length === 0) {
    ideaHint.hidden = false;
  } else {
    ideaHint.hidden = true;
    ideas.forEach((idea) => ideaList.appendChild(renderIdeaItem(idea)));
  }
}

async function submitIdea() {
  const url = ideaUrlInput.value.trim();
  const note = ideaNoteInput.value.trim();
  if (!url) return;

  ideaSubmitBtn.disabled = true;
  ideaStatus.textContent = "Saving…";

  let category = "other";
  let title = null;
  try {
    const res = await fetch("/api/ideas/categorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (res.ok) {
      const data = await res.json();
      category = data.category || "other";
      title = data.title || null;
    }
  } catch (err) {
    console.warn("Idea categorize failed, saving uncategorized", err);
  }

  const ideas = loadIdeas();
  ideas.unshift({
    id: makeId(),
    url,
    note,
    title,
    category,
    source: detectIdeaSource(url),
    createdAt: Date.now(),
  });
  saveIdeasList(ideas);

  ideaUrlInput.value = "";
  ideaNoteInput.value = "";
  ideaStatus.textContent = "";
  ideaSubmitBtn.disabled = false;
  renderIdeas();
}

ideaSubmitBtn.addEventListener("click", submitIdea);
renderIdeas();

render();

const SYNC_KEYS = {
  tasks: STORAGE_KEY,
  journal: JOURNAL_KEY,
  ideas: IDEAS_KEY,
  stocks: STOCKS_KEY,
};

async function hydrateFromServer() {
  const results = await Promise.allSettled(
    Object.entries(SYNC_KEYS).map(async ([serverKey, localKey]) => {
      const res = await fetch(`/api/sync/${serverKey}`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const { value } = await res.json();
      return { serverKey, localKey, value };
    })
  );

  let tasksChanged = false;
  let ideasChanged = false;
  let journalChanged = false;
  let stocksChanged = false;

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { serverKey, localKey, value } = result.value;

    if (value == null) {
      const localRaw = localStorage.getItem(localKey);
      if (localRaw != null) {
        try {
          syncToServer(serverKey, JSON.parse(localRaw));
        } catch (err) {
          /* malformed local data, skip migration */
        }
      }
      continue;
    }

    localStorage.setItem(localKey, JSON.stringify(value));
    if (serverKey === "tasks") {
      tasks = value;
      tasksChanged = true;
    } else if (serverKey === "ideas") {
      ideasChanged = true;
    } else if (serverKey === "journal") {
      journalChanged = true;
    } else if (serverKey === "stocks") {
      stocksChanged = true;
    }
  }

  if (tasksChanged) render();
  if (ideasChanged) renderIdeas();
  if (journalChanged) initJournal();
  if (stocksChanged) loadStockQuotes();
}

hydrateFromServer();
