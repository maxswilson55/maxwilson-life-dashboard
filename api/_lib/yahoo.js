const CHART_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

async function fetchQuote(symbol) {
  try {
    const res = await fetch(`${CHART_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=1d`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LifeDashboard/1.0)" },
    });
    if (!res.ok) return { symbol, error: true };
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta || meta.regularMarketPrice == null) return { symbol, error: true };
    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose ?? meta.chartPreviousClose;
    const change = prevClose != null ? price - prevClose : null;
    const changePercent = prevClose ? (change / prevClose) * 100 : null;
    return {
      symbol,
      price,
      change,
      changePercent,
      currency: meta.currency || "",
      error: false,
    };
  } catch (err) {
    console.error(`Failed to fetch quote for ${symbol}`, err);
    return { symbol, error: true };
  }
}

export async function fetchQuotes(symbols) {
  return Promise.all(symbols.map(fetchQuote));
}
