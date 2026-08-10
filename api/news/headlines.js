import { fetchBusinessNews } from "../_lib/news.js";

export default async function handler(req, res) {
  try {
    const items = await fetchBusinessNews();
    res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "news_fetch_failed" });
  }
}
