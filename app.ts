import { App, AppOptions } from "@slack/bolt";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
} as AppOptions);

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt is running!");
})();

