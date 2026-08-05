export default function handler(req, res) {
  res.setHeader("Set-Cookie", "gcal_rt=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0");
  res.status(200).json({ ok: true });
}
