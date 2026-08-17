import { kvGet, kvSet } from "../_lib/store.js";

const ALLOWED_KEYS = ["tasks", "journal", "ideas", "stocks", "brief"];

// Two devices can each hold a version of this data that the other has never
// seen (e.g. reminders added on a phone that a rarely-opened desktop tab
// doesn't know about yet). A blind overwrite on every sync means whichever
// device happens to save last silently erases whatever the other device
// had that it didn't. Merging instead means neither side's data disappears
// just because the other device saved more recently.
//
// Trade-off: a task/idea deleted on one device can reappear if another
// device still has a local copy and syncs afterward, since this merges by
// union rather than tracking deletions explicitly. That's an intentional
// choice — an occasionally-resurrected deleted item is a far smaller
// problem than silently losing a week of real data.
function mergeSyncValue(key, existing, incoming) {
  if (existing == null) return incoming;
  if (incoming == null) return existing;

  if (key === "tasks" || key === "ideas") {
    const byId = new Map();
    for (const item of existing) if (item && item.id) byId.set(item.id, item);
    for (const item of incoming) if (item && item.id) byId.set(item.id, item);
    return [...byId.values()];
  }

  if (key === "journal") {
    return { ...existing, ...incoming };
  }

  if (key === "stocks") {
    return [...new Set([...existing, ...incoming])];
  }

  // "brief" and anything else: single-value payloads, plain overwrite is fine.
  return incoming;
}

export default async function handler(req, res) {
  const { key } = req.query;
  if (!ALLOWED_KEYS.includes(key)) {
    res.status(404).json({ error: "unknown_key" });
    return;
  }

  const storageKey = `sync:${key}`;

  if (req.method === "GET") {
    try {
      const raw = await kvGet(storageKey);
      res.status(200).json({ value: raw ? JSON.parse(raw) : null });
    } catch (err) {
      console.error(`Sync GET failed for ${key}`, err);
      res.status(500).json({ error: "sync_read_failed" });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const existingRaw = await kvGet(storageKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : null;
      const merged = mergeSyncValue(key, existing, req.body);
      await kvSet(storageKey, JSON.stringify(merged));
      res.status(200).json({ ok: true, value: merged });
    } catch (err) {
      console.error(`Sync POST failed for ${key}`, err);
      res.status(500).json({ error: "sync_write_failed" });
    }
    return;
  }

  res.status(405).json({ error: "method_not_allowed" });
}
