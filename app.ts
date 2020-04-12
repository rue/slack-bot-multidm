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

app.message("hello", async ({ message, say }) => {
  console.log({ event: "helloEvent", message });

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

  await say({
    blocks: [section],
    text:
      "This say() contains a section block; this text should not be displayed",
  });
});

// Actions

app.action("hello_button_click", async ({ body, ack, say }) => {
  console.log({ event: "action hello_button_click", body });

  await ack();

  await say(`<@${body.user.id}> clicked the button, the dummy!`);
});

// Main

(async (): Promise<void> => {
  await app.start(PORT);
  console.log(`⚡️ Bolt is running on ${PORT}!`);
})();
