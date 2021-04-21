import { endOfDay, parse } from "date-fns";
import { da, de } from "date-fns/locale";
import generator from "ical-generator";
import { JSDOM } from "jsdom";

import { MensaWeek } from "../typings";
import { formatInnerHtml } from "../utils/html";

export const createMensaEvents = (mensaTimetable: MensaWeek) => {
  const calendar = generator();

  mensaTimetable.forEach(({ main, second, date }) => {
    const start = endOfDay(date);

    const mainDescription = main ? `🥩  ${main.description} ${main.price}` : "";
    const secondDescription = second
      ? `🥦  ${second.description} ${second.price}`
      : "";

    calendar.createEvent({
      summary: main ? main.description : second.description,
      start,
      allDay: true,
      description:
        mainDescription +
        (mainDescription && secondDescription ? "\n\n" : "") +
        secondDescription,
      location: "Mensa",
    });
  });

  return calendar;
};

const formatDescription = (description: string) =>
  formatInnerHtml(description.replace(/ \(.*\)/, ""));

const formatMensaPrice = (priceString: string) =>
  priceString.replace("Eur", "€");

export const formatMensaTimetable = (mensaHtml: string) => {
  if (!mensaHtml) return [];

  const { document } = new JSDOM(mensaHtml).window;
  const days = document.querySelectorAll(".speiseplan-tag-container");
  const dates = Array.from(document.querySelectorAll("td.speiseplan-head"));

  return Array.from(days)
    .map((column, index) => {
      const [main, second] = Array.from(column.querySelectorAll(".gericht"));

      if (!main && !second) return;

      const unformattedDate = dates[index].textContent;
      if (!unformattedDate) return;
      const date = formatInnerHtml(unformattedDate);

      const parsedDate = parse(date, "EEEE, d.M.", new Date(), {
        locale: de,
      });

      const mainDish = main && {
        description: formatDescription(
          main.querySelector(".speiseplan-kurzbeschreibung").textContent
        ),
        price: formatMensaPrice(
          formatInnerHtml(main.querySelector(".speiseplan-preis").textContent)
        ),
      };

      const secondDish = second && {
        description: formatDescription(
          second.querySelector(".speiseplan-kurzbeschreibung").textContent
        ),
        price: formatMensaPrice(
          formatInnerHtml(second.querySelector(".speiseplan-preis").textContent)
        ),
      };

      return {
        date: parsedDate,
        main: mainDish,
        second: secondDish,
      };
    })
    .filter((value) => value !== undefined) as MensaWeek;
};