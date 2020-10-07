import nak from "../nak";
import calendar from "../calendar";
import telegram from "../telegram";
import { Logger } from "../utils";

import bucket from "../aws/bucket";

const { CHAT_ID } = process.env;

export const format = async () => {
  const logger = new Logger(4);

  logger.print("Fetching mensa timetable");
  const mensaHtml = await nak.fetchMensaTimetable();
  if (!mensaHtml) {
    await telegram.sendMessage(CHAT_ID, "mensa seite nicht verfügbar");
    return;
  }

  const mensaTimetable = nak.formatMensaTimetable(mensaHtml);
  if (!mensaTimetable || !mensaTimetable.length) {
    logger.print("No mensa timetable found. Exit function...");
    await telegram.sendMessage(CHAT_ID, "kein Mensaplan gefunden");
    return;
  }

  logger.print("Creating mensa events");
  const mensaCalendar = calendar.createMensaEvents(mensaTimetable);

  logger.print("Uploading file to S3");
  await bucket.uploadToS3(mensaCalendar.toString(), "Mensa.ics");

  logger.print("Sending notification");
  return await telegram.sendMessage(CHAT_ID, "mensa fertig! lol 🥳");
};
