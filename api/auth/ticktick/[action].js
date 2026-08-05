import crypto from "node:crypto";
import { parseCookies } from "../../_lib/cookies.js";
import { encrypt } from "../../_lib/crypto.js";
import { exchangeCode } from "../../_lib/ticktick.js";

function start(req, res) {
  const redirectUri = `https://${req.headers.host}/api/auth/ticktick/callback`;
  const state = crypto.randomUUID();

  res.setHeader(
    "Set-Cookie",
    `tt_oauth_state=${state}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=600`
  );

  const params = new URLSearchParams({
    client_id: process.env.TICKTICK_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "tasks:read",
    state,
  });

  res.writeHead(302, { Location: `https://ticktick.com/oauth/authorize?${params}` });
  res.end();
}

async function callback(req, res) {
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

function status(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  res.status(200).json({ connected: Boolean(cookies.tt_at) });
}

function disconnect(req, res) {
  res.setHeader("Set-Cookie", "tt_at=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0");
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
