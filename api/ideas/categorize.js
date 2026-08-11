const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const note = (req.body && req.body.note) || "";
  if (!note.trim()) {
    res.status(200).json({ category: "other", title: null });
    return;
  }

  const prompt = `Classify this saved social media post note into exactly one category: "life-hack", "business-idea", or "other". Also write a short 3-6 word title summarizing it. Respond with ONLY valid JSON (no markdown fences, no commentary): {"category": "life-hack|business-idea|other", "title": "<short title>"}

Note:
"""
${note}
"""`;

  try {
    const aiRes = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      console.error("Anthropic API error", aiRes.status, await aiRes.text());
      res.status(200).json({ category: "other", title: null });
      return;
    }

    const data = await aiRes.json();
    const raw = data.content?.[0]?.text || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      res.status(200).json({ category: "other", title: null });
      return;
    }
    const parsed = JSON.parse(match[0]);
    res.status(200).json({
      category: ["life-hack", "business-idea", "other"].includes(parsed.category) ? parsed.category : "other",
      title: parsed.title || null,
    });
  } catch (err) {
    console.error(err);
    res.status(200).json({ category: "other", title: null });
  }
}
