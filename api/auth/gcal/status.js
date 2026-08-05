import { parseCookies } from "../../_lib/cookies.js";

export default function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  res.status(200).json({ connected: Boolean(cookies.gcal_rt) });
}
