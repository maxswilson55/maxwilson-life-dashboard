import { fetchQuotes } from "../_lib/yahoo.js";

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const symbolsParam = url.searchParams.get("symbols") || "";
  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25);

  if (symbols.length === 0) {
    res.status(200).json({ quotes: [] });
    return;
  }

  try {
    const quotes = await fetchQuotes(symbols);
    res.status(200).json({ quotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "quotes_fetch_failed" });
  }
}
