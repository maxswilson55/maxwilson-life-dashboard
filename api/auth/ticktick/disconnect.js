export default function handler(req, res) {
  res.setHeader("Set-Cookie", "tt_at=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0");
  res.status(200).json({ ok: true });
}
