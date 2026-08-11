import { kvGet, kvSet } from "../_lib/store.js";

const ALLOWED_KEYS = ["tasks", "journal", "ideas", "stocks"];

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
      await kvSet(storageKey, JSON.stringify(req.body));
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error(`Sync POST failed for ${key}`, err);
      res.status(500).json({ error: "sync_write_failed" });
    }
    return;
  }

  res.status(405).json({ error: "method_not_allowed" });
}
