import { parseCookies } from "../_lib/cookies.js";
import { decrypt } from "../_lib/crypto.js";
import { findOpenTasks } from "../_lib/ticktick.js";

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.tt_at) {
    res.status(401).json({ error: "not_connected" });
    return;
  }

  let stored;
  try {
    stored = JSON.parse(decrypt(cookies.tt_at, process.env.COOKIE_ENCRYPTION_KEY));
  } catch (err) {
    res.status(401).json({ error: "not_connected" });
    return;
  }

  if (stored.expiresAt && Date.now() > stored.expiresAt) {
    res.status(401).json({ error: "expired" });
    return;
  }

  try {
    const tasks = await findOpenTasks(stored.accessToken);
    res.status(200).json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ticktick_fetch_failed" });
  }
}
