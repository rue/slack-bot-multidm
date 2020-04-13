import { App } from "@slack/bolt";
import { ConsoleLogger, LogLevel } from "@slack/logger";
import { SectionBlock } from "@slack/types";

const PORT = process.env.PORT || 3000;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logger: new ConsoleLogger(),
  logLevel: LogLevel.DEBUG,
});

// Events

app.error(async (error) => {
  console.error({ type: "error", event: "fallbackErrorHandler", error });
});

app.message("hello", async ({ message, say, logger }) => {
  logger.info({ type: "message", event: "hello", message });

  /* eslint-disable @typescript-eslint/camelcase */
  const section: SectionBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Hey there <@${message.user}>!`,
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Click Me",
      },
      action_id: "hello_button_click",
    },
  };

  try {
    await say({
      blocks: [section],
      text:
        "This say() contains a section block; this text should not be displayed",
    });
  } catch (error) {
    logger.error({ type: "error", event: "hello", error });
  }
});

// Actions

app.action("hello_button_click", async ({ body, ack, say, logger }) => {
  logger.info({ type: "action", event: "hello_button_click", body });

  try {
    await ack();

    await say(`<@${body.user.id}> clicked the button, the dummy!`);
  } catch (error) {
    logger.error({ type: "error", event: "hello click", error });
  }
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
  console.log(`⚡️ Bolt is running on ${PORT}!`);
})();
