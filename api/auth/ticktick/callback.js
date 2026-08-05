import { parseCookies } from "../../_lib/cookies.js";
import { encrypt } from "../../_lib/crypto.js";
import { exchangeCode } from "../../_lib/ticktick.js";

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookies = parseCookies(req.headers.cookie);

  if (!code || !state || state !== cookies.tt_oauth_state) {
    res.status(400).send("Invalid OAuth state. Go back to the dashboard and try connecting again.");
    return;
  }

  const redirectUri = `https://${req.headers.host}/api/auth/ticktick/callback`;
  let tokens;
  try {
    tokens = await exchangeCode(code, redirectUri);
  } catch (err) {
    console.error(err);
    res.status(400).send("TickTick didn't return a valid token. Try connecting again.");
    return;
  }

  const payload = JSON.stringify({
    accessToken: tokens.access_token,
    expiresAt: Date.now() + (tokens.expires_in || 0) * 1000,
  });
  const encrypted = encrypt(payload, process.env.COOKIE_ENCRYPTION_KEY);

  res.setHeader("Set-Cookie", [
    `tt_at=${encrypted}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=15552000`,
    `tt_oauth_state=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0`,
  ]);
  res.writeHead(302, { Location: "/?ticktick=connected" });
  res.end();
}
