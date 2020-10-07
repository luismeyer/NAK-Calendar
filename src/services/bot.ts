// @ts-expect-error ts-migrate(1192) FIXME: Module '"/Users/luis.meyer/Projects/nak-calendar/s... Remove this comment to see the full error message
import bot from "../telegram";
import { isLocal } from "../utils";

// @ts-expect-error ts-migrate(1192) FIXME: Module '"/Users/luis.meyer/Projects/nak-calendar/s... Remove this comment to see the full error message
import lambda from "../aws/lambda";

export const handle = async (event: any) => {
  const body = isLocal() ? event.body : JSON.parse(event.body);
  const { text, chat } = body.message;
  console.log("Received Message: ", text);

  switch (text.toLowerCase()) {
    case "/synctimetable":
      await bot.sendMessage(chat.id, "starte kalendar-api 📆");
      await lambda.callTimetableApi();
      break;
    case "/syncmensa":
      await bot.sendMessage(chat.id, "starte mensa-api 🍔");
      await lambda.callMensaApi();
      break;
    case "/help":
      await bot.sendMessage(chat.id, "Nö 😋");
      break;
    case "/start":
      await bot.sendMessage(chat.id, "heyyyyyy 🤗👋");
      break;
    default:
      await bot.sendMessage(chat.id, "Will nicht mit dir reden 🤐 ");
      break;
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      message: "Alles Cool",
      json: event.body,
    }),
  };
};
