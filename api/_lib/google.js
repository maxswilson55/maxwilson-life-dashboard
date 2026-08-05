const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";
const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3";

export async function getAccessToken(refreshToken) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function gmailFetch(accessToken, path) {
  const res = await fetch(`${GMAIL_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Gmail API error ${res.status} for ${path}`);
  return res.json();
}

function headerValue(headers, name) {
  const h = (headers || []).find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : "";
}

async function searchThreads(accessToken, query, myEmail, reason) {
  const list = await gmailFetch(accessToken, `/threads?q=${encodeURIComponent(query)}&maxResults=15`);
  const threads = list.threads || [];
  const results = [];
  for (const t of threads) {
    const full = await gmailFetch(
      accessToken,
      `/threads/${t.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`
    );
    const lastMsg = full.messages[full.messages.length - 1];
    const from = headerValue(lastMsg.payload.headers, "From");
    const subject = headerValue(lastMsg.payload.headers, "Subject") || "(no subject)";
    const fromMe = from.toLowerCase().includes(myEmail.toLowerCase());
    if (reason === "awaiting_reply" && fromMe) continue;
    results.push({
      threadId: t.id,
      subject,
      from,
      reason,
      link: `https://mail.google.com/mail/u/0/#inbox/${t.id}`,
    });
  }
  return results;
}

export async function listUpcomingEvents(accessToken) {
  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: weekAhead.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "20",
  });
  const res = await fetch(`${CALENDAR_BASE}/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Calendar API error ${res.status}`);
  const data = await res.json();

  return (data.items || [])
    .filter((e) => e.status !== "cancelled")
    .map((e) => ({
      id: e.id,
      title: e.summary || "(no title)",
      start: e.start.dateTime || e.start.date,
      allDay: !e.start.dateTime,
      location: e.location || "",
      link: e.htmlLink,
    }));
}

export async function findActionItems(accessToken) {
  const profile = await gmailFetch(accessToken, "/profile");
  const myEmail = profile.emailAddress;

  const [starred, awaitingReply] = await Promise.all([
    searchThreads(accessToken, "is:starred newer_than:60d", myEmail, "starred"),
    searchThreads(accessToken, "in:inbox -is:chat newer_than:14d", myEmail, "awaiting_reply"),
  ]);

  const seen = new Set();
  const items = [];
  for (const item of [...starred, ...awaitingReply]) {
    if (seen.has(item.threadId)) continue;
    seen.add(item.threadId);
    items.push(item);
  }
  return items;
}
