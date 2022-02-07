import { scrape } from "./scrape.js";

scrape();

setInterval(scrape, 5 * 60 * 1000);
