import { parseCookies } from "../_lib/cookies.js";
import { decrypt } from "../_lib/crypto.js";
import { getAccessToken, findActionItems } from "../_lib/google.js";

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.gmail_rt) {
    res.status(401).json({ error: "not_connected" });
    return;
  }
  try {
    const refreshToken = decrypt(cookies.gmail_rt, process.env.COOKIE_ENCRYPTION_KEY);
    const accessToken = await getAccessToken(refreshToken);
    const items = await findActionItems(accessToken);
    res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "gmail_fetch_failed" });
  }
}
