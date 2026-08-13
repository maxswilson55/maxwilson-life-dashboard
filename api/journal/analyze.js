const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

function buildBriefPrompt(stats) {
  const lines = [];
  lines.push(`Due today: ${stats.dueTodayCount} task(s)${stats.dueTodayTitles?.length ? ` — ${stats.dueTodayTitles.join("; ")}` : ""}`);
  lines.push(`Overdue: ${stats.overdueCount} task(s)`);
  lines.push(`Open tasks total: ${stats.openCount}`);
  if (stats.waitingStale?.length) {
    lines.push(
      `Waiting on someone else, no movement in a while: ${stats.waitingStale
        .map((w) => `"${w.title}" waiting on ${w.waitingOn} for ${w.days} days`)
        .join("; ")}`
    );
  }
  if (stats.stalledChains?.length) {
    lines.push(
      `Stalled follow-up chains: ${stats.stalledChains
        .map((c) => `"${c.title}" (${c.steps} steps, started ${c.ageDays} days ago)`)
        .join("; ")}`
    );
  }
  if (stats.nextUpcoming) {
    lines.push(`Next upcoming dated task: "${stats.nextUpcoming.title}" on ${stats.nextUpcoming.due}`);
  }
  if (stats.recentMoods?.length) {
    lines.push(`Recent mood check-ins: ${stats.recentMoods.map((m) => `${m.date}: ${m.label} (${m.score}/10)`).join("; ")}`);
  }

  return `You are writing a short, warm, personal morning briefing for someone's daily dashboard, based on the real state of their tasks below. Write exactly 3-4 sentences in second person ("you"), natural and specific — reference actual task titles and day counts where given, not generic motivational language. If everything genuinely looks clear, say so briefly and don't invent problems. If there's a clear highest-value next action, end by naming it.

Respond with ONLY valid JSON (no markdown fences, no commentary) in exactly this shape:
{"brief": "<3-4 sentence paragraph>"}

Today's state:
${lines.join("\n")}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  if (req.body && req.body.mode === "brief") {
    const stats = req.body.stats || {};
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
          max_tokens: 300,
          messages: [{ role: "user", content: buildBriefPrompt(stats) }],
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        console.error("Anthropic API error (brief)", aiRes.status, errText);
        res.status(502).json({ error: "ai_call_failed" });
        return;
      }

      const data = await aiRes.json();
      const raw = data.content?.[0]?.text || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Could not find JSON in AI response (brief)", raw);
        res.status(502).json({ error: "ai_parse_failed" });
        return;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      res.status(200).json(parsed);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "brief_failed" });
    }
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
