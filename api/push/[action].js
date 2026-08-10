import { kvGet, kvSet } from "../_lib/store.js";
import { sendPush } from "../_lib/push.js";

const SUBSCRIPTION_KEY = "push:subscription";

function vapidPublicKey(req, res) {
  res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
}

async function subscribe(req, res) {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    res.status(400).json({ error: "invalid_subscription" });
    return;
  }
  await kvSet(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  res.status(200).json({ ok: true });
}

async function unsubscribe(req, res) {
  await kvSet(SUBSCRIPTION_KEY, "");
  res.status(200).json({ ok: true });
}

async function send(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const raw = await kvGet(SUBSCRIPTION_KEY);
  if (!raw) {
    res.status(200).json({ sent: false, reason: "no_subscription" });
    return;
  }

  const subscription = JSON.parse(raw);
  try {
    await sendPush(subscription, {
      title: "Daily Check-in",
      body: "How was your day? Tap to check in.",
      url: "/",
    });
    res.status(200).json({ sent: true });
  } catch (err) {
    console.error("Push send failed", err);
    res.status(500).json({ error: "send_failed" });
  }
}

export default async function handler(req, res) {
  switch (req.query.action) {
    case "vapid-public-key":
      return vapidPublicKey(req, res);
    case "subscribe":
      return subscribe(req, res);
    case "unsubscribe":
      return unsubscribe(req, res);
    case "send":
      return send(req, res);
    default:
      res.status(404).end();
  }
}
