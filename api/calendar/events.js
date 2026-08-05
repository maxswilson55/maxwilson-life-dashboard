import { parseCookies } from "../_lib/cookies.js";
import { decrypt } from "../_lib/crypto.js";
import { getAccessToken, listUpcomingEvents } from "../_lib/google.js";

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.gcal_rt) {
    res.status(401).json({ error: "not_connected" });
    return;
  }
  try {
    const refreshToken = decrypt(cookies.gcal_rt, process.env.COOKIE_ENCRYPTION_KEY);
    const accessToken = await getAccessToken(refreshToken);
    const events = await listUpcomingEvents(accessToken);
    res.status(200).json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "calendar_fetch_failed" });
  }
}
