import { parseCookies } from "../_lib/cookies.js";
import { decrypt } from "../_lib/crypto.js";
import { getAccessToken, listUpcomingEvents, createCalendarEvent } from "../_lib/google.js";

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.gcal_rt) {
    res.status(401).json({ error: "not_connected" });
    return;
  }

  let accessToken;
  try {
    const refreshToken = decrypt(cookies.gcal_rt, process.env.COOKIE_ENCRYPTION_KEY);
    accessToken = await getAccessToken(refreshToken);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "calendar_auth_failed" });
    return;
  }

  if (req.method === "POST") {
    const { title, dateISO, time } = req.body || {};
    if (!title || !dateISO || !time) {
      res.status(400).json({ error: "missing_fields" });
      return;
    }
    try {
      const event = await createCalendarEvent(accessToken, { title, dateISO, time });
      res.status(200).json(event);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "calendar_create_failed" });
    }
    return;
  }

  try {
    const events = await listUpcomingEvents(accessToken);
    res.status(200).json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "calendar_fetch_failed" });
  }
}
