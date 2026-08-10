import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:maxswilson55@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendPush(subscription, payload) {
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}
