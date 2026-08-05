import crypto from "node:crypto";
import { parseCookies } from "../../_lib/cookies.js";
import { encrypt } from "../../_lib/crypto.js";

function start(req, res) {
  const redirectUri = `https://${req.headers.host}/api/auth/gcal/callback`;
  const scope = "https://www.googleapis.com/auth/calendar.readonly";
  const state = crypto.randomUUID();

  res.setHeader(
    "Set-Cookie",
    `gcal_oauth_state=${state}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=600`
  );

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  res.writeHead(302, { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  res.end();
}

async function callback(req, res) {
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

function status(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  res.status(200).json({ connected: Boolean(cookies.gcal_rt) });
}

function disconnect(req, res) {
  res.setHeader("Set-Cookie", "gcal_rt=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0");
  res.status(200).json({ ok: true });
}

export default async function handler(req, res) {
  switch (req.query.action) {
    case "start":
      return start(req, res);
    case "callback":
      return callback(req, res);
    case "status":
      return status(req, res);
    case "disconnect":
      return disconnect(req, res);
    default:
      res.status(404).end();
  }
}
