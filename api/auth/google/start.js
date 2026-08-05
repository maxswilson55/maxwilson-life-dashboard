import crypto from "node:crypto";

export default function handler(req, res) {
  const redirectUri = `https://${req.headers.host}/api/auth/google/callback`;
  const scope = "https://www.googleapis.com/auth/gmail.readonly";
  const state = crypto.randomUUID();

  res.setHeader(
    "Set-Cookie",
    `oauth_state=${state}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=600`
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
