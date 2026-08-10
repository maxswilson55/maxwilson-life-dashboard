const FEEDS = [
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", source: "CNBC" },
  { url: "https://www.ft.com/rss/home", source: "FT" },
];

function extractTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return null;
  let val = m[1].trim();
  const cdata = val.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  if (cdata) val = cdata[1].trim();
  return val;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function parseRss(xml, source) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml))) {
    const block = m[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    if (!title || !link) continue;
    items.push({
      title: decodeEntities(title),
      link: link.trim(),
      pubDate: pubDate ? new Date(pubDate).getTime() : Date.now(),
      source,
    });
  }
  return items;
}

async function fetchFeed(feed) {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LifeDashboard/1.0)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRss(xml, feed.source);
  } catch (err) {
    console.error(`Failed to fetch ${feed.source} feed`, err);
    return [];
  }
}

export async function fetchBusinessNews() {
  const results = await Promise.all(FEEDS.map(fetchFeed));
  return results
    .flat()
    .sort((a, b) => b.pubDate - a.pubDate)
    .slice(0, 20);
}
