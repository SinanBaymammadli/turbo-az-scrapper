import { schedule } from "@netlify/functions";
import { scrape } from "../../src/scrape.js";

export const handler = schedule("@hourly", async (event, context) => {
  await scrape();

  return {
    statusCode: 200,
  };
});
