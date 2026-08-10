const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const text = (req.body && req.body.text) || "";
  if (!text.trim()) {
    res.status(400).json({ error: "empty_text" });
    return;
  }

  const prompt = `You are analyzing a personal daily journal entry. Read the entry and respond with ONLY valid JSON (no markdown fences, no commentary) in exactly this shape:
{"mood": {"emoji": "<single emoji>", "label": "<one or two word mood label>", "score": <integer 1-10, 1=very bad 10=excellent>}, "tasks": [{"title": "<short actionable task title>"}]}

Only include genuinely actionable to-dos the person mentioned (things they said they need to do, forgot to do, or are planning to do) — not every sentence, and not things already done. If there are none, use an empty array. Keep task titles short and action-oriented (imperative form, e.g. "Call the dentist").

Journal entry:
"""
${text}
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
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("Anthropic API error", aiRes.status, errText);
      res.status(502).json({ error: "ai_call_failed" });
      return;
    }

    const data = await aiRes.json();
    const raw = data.content?.[0]?.text || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not find JSON in AI response", raw);
      res.status(502).json({ error: "ai_parse_failed" });
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "analyze_failed" });
  }
}
