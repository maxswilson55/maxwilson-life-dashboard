const TOKEN_URL = "https://ticktick.com/oauth/token";
const API_BASE = "https://api.ticktick.com/open/v1";

export async function exchangeCode(code, redirectUri) {
  const basic = Buffer.from(
    `${process.env.TICKTICK_CLIENT_ID}:${process.env.TICKTICK_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      scope: "tasks:read",
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) throw new Error(`TickTick token exchange failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function ttFetch(accessToken, path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`TickTick API error ${res.status} for ${path}`);
  return res.json();
}

// TickTick priority: 0 = unset (treated as neutral "medium"), 1 = Low, 3 = Medium, 5 = High
const PRIORITY_MAP = { 0: "medium", 1: "low", 3: "medium", 5: "high" };

export async function findOpenTasks(accessToken) {
  const projects = await ttFetch(accessToken, "/project");
  const results = [];

  for (const project of projects) {
    let data;
    try {
      data = await ttFetch(accessToken, `/project/${project.id}/data`);
    } catch (err) {
      continue;
    }
    for (const task of data.tasks || []) {
      if (task.status === 2) continue;
      results.push({
        id: task.id,
        title: task.title,
        projectName: project.name,
        priority: PRIORITY_MAP[task.priority] ?? "medium",
        due: task.dueDate ? task.dueDate.slice(0, 10) : null,
        link: `https://ticktick.com/webapp/#p/${project.id}/tasks/${task.id}`,
      });
    }
  }

  return results;
}
