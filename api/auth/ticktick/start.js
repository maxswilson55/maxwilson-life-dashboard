import crypto from "node:crypto";

export default function handler(req, res) {
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
