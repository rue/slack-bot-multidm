import { App } from "@slack/bolt";
import { Logger, LogLevel } from "@slack/logger";

const PORT = process.env.PORT || 3000;
const USER_TOKEN = process.env.SLACK_MULTIDM_USER_TOKEN;

const app = new App({
  token: process.env.SLACK_MULTIDM_BOT_TOKEN,
  signingSecret: process.env.SLACK_MULTIDM_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
});

// Helpers
function parseUsersAndMessage(text: string): [string[], string] {
  if (text.length < 10) {
    throw `text too short to be valid: ${text}`;
  }

  const [users, message] = text.split(":", 2);

  if (!users || users.length < 10 || !message || message.length < 1) {
    throw `text seems invalid: ${text}`;
  }

  // string.matchAll() creates some asinine
  // IterableIterator<RegExpMatchArray> type,
  // so let's just use lookbehind/lookahead.
  const userIds = users.match(/(?<=<@)\w+(?=\|)/g);

  if (userIds === null || userIds.length < 1) {
    throw `no valid-looking user IDs found: ${text}`;
  }

  const userIdStrings = userIds.slice();

  return [userIdStrings, message.trim()];
}

async function dmUser(
  targetUserId: string,
  message: string,
  myUserToken: string | undefined,
  logger: Logger,
): Promise<void> {
  if (typeof myUserToken !== "string") {
    throw `No token set!`;
  }

  const createDMResult = await app.client.conversations.open({
    token: USER_TOKEN,
    users: targetUserId,
  });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const channel: any = createDMResult.channel;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const channelId: any = channel.id;

  logger.info({
    type: "response",
    event: "create DM result",
    result: createDMResult,
  });

  const postDMResult = await app.client.chat.postMessage({
    token: USER_TOKEN,
    channel: channelId as string,
    text: message,
  });

  logger.info({
    type: "response",
    event: "post DM result",
    postresult: postDMResult,
  });
}

// Events

app.error(async (error) => {
  console.error({ type: "error", event: "fallbackErrorHandler", error });
});

// Commands

app.command("/multidm", async ({ command, ack, context, logger }) => {
  logger.info({ type: "command", event: "/multidm", command, context });

  try {
    const [users, message] = parseUsersAndMessage(command.text);

    logger.info({
      event: "parsed",
      users,
      message,
    });

    await ack();

    const senderToken =
      command.user === "rue" && USER_TOKEN ? USER_TOKEN : context.botToken;

    const sentDmPromises = users.map((user) => {
      dmUser(user, message, senderToken, logger);
    });

    await Promise.all(sentDmPromises);

    const confirmationMessage = `Sent DMs to users. Message: ${message}`;

    await dmUser(
      context.user_id,
      confirmationMessage,
      context.botToken,
      logger,
    );
  } catch (error) {
    logger.error({
      type: "error",
      event: "/multidm",
      error,
      /* eslint-disable @typescript-eslint/camelcase */
      meta: error && error.data && error.data.response_metadata,
    });
  }
});

// Main

(async (): Promise<void> => {
  await app.start(PORT);
  console.log(`⚡️ MultiDM bot is running on ${PORT}!`);
})();
