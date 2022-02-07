import "dotenv/config";
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";
import fetch from "node-fetch";

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;

const turboAzUrl =
  "https://turbo.az/autos?utf8=%E2%9C%93&q%5Bmake%5D%5B%5D=&q%5Bmake%5D%5B%5D=1&q%5Bregion%5D%5B%5D=&q%5Bregion%5D%5B%5D=1&q%5Bmodel%5D%5B%5D=&q%5Bmodel%5D%5B%5D=103&q%5Bfuel_type%5D%5B%5D=&q%5Bcategory%5D%5B%5D=&q%5Bgear%5D%5B%5D=&q%5Bcolor%5D%5B%5D=&q%5Bcolor%5D%5B%5D=27&q%5Bcolor%5D%5B%5D=7&q%5Bcolor%5D%5B%5D=8&q%5Btransmission%5D%5B%5D=&q%5Bmileage_from%5D=&q%5Bmileage_to%5D=&q%5Byear_from%5D=2014&q%5Byear_to%5D=&q%5Bprice_from%5D=&q%5Bprice_to%5D=&q%5Bcurrency%5D=azn&q%5Bengine_volume_from%5D=0&q%5Bengine_volume_to%5D=&q%5Bloan%5D=0&q%5Bbarter%5D=0&q%5Bextras%5D%5B%5D=&q%5Bsort%5D=created_at&q%5Bused%5D=&button=";

let lastLinks = [];

export async function scrape() {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    headless: chromium.headless,
  });
  const page = await browser.newPage();

  await page.goto(turboAzUrl);

  await page.waitForSelector(".products");

  const urls = await page.$$eval(".products", (products) => {
    const list =
      products[products.length - 1].querySelectorAll(".products-i__link");
    let links = [];

    for (const item of list) {
      links.push(item.href);
    }

    return links;
  });

  const date = new Date().toLocaleString();

  if (!lastLinks.includes(urls[0])) {
    const newLink = urls[0];
    lastLinks.push(newLink);
    console.log(`${date}: ${newLink}`);
    fetch(
      `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${newLink}`,
      { method: "POST" }
    );
  } else {
    console.log(`${date}: No new cars`);
  }

  await browser.close();
}
