import { parseCookies } from "../../_lib/cookies.js";
import { encrypt } from "../../_lib/crypto.js";

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookies = parseCookies(req.headers.cookie);

  if (!code || !state || state !== cookies.gcal_oauth_state) {
    res.status(400).send("Invalid OAuth state. Go back to the dashboard and try connecting again.");
    return;
  }

  const redirectUri = `https://${req.headers.host}/api/auth/gcal/callback`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenRes.json();

  if (!tokens.refresh_token) {
    res
      .status(400)
      .send(
        "Google didn't return a refresh token. Remove the app at https://myaccount.google.com/permissions and try connecting again."
      );
    return;
  }

  const encrypted = encrypt(tokens.refresh_token, process.env.COOKIE_ENCRYPTION_KEY);
  res.setHeader("Set-Cookie", [
    `gcal_rt=${encrypted}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=31536000`,
    `gcal_oauth_state=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0`,
  ]);
  res.writeHead(302, { Location: "/?calendar=connected" });
  res.end();
}
