import { App } from "@slack/bolt";
import { LogLevel } from "@slack/logger";

const PORT = process.env.PORT || 3000;

const app = new App({
  token: process.env.SLACK_MULTIDM_BOT_TOKEN,
  signingSecret: process.env.SLACK_MULTIDM_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
});

// Events

app.error(async (error) => {
  console.error({ type: "error", event: "fallbackErrorHandler", error });
});

// Commands

app.command("/multidm", async ({ command, ack, say, logger }) => {
  logger.info({ type: "command", event: "/multidm", command });

  try {
    await ack();

    await say(`@hello slashcommanded!`);
  } catch (error) {
    logger.error({ type: "error", event: "/multidm", error });
  }
});

// Main

(async (): Promise<void> => {
  await app.start(PORT);
  console.log(`⚡️ MultiDM bot is running on ${PORT}!`);
})();
