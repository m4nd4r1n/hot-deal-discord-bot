import { load } from "cheerio";
import puppeteer from "puppeteer";

import { sleep } from "./utils.js";
import os from "os";
import type { TSaleInfo } from "./types/index.js";

const URL = "https://quasarzone.com/bbs/qb_saleinfo";
const ORIGIN = "https://quasarzone.com";

const SELECTER = {
  TABLE:
    "#frmSearch > div > div.list-board-wrap > div.market-type-list.market-info-type-list.relative > table",
  ROW: "td:nth-child(2) > div",
  TITLE: "div.market-info-list-cont > p > a > span.ellipsis-with-reply-cnt",
  URL: "p > a",
  COST: "div.market-info-list-cont > div > p:nth-child(1) > span:nth-child(2) > span.text-orange",
  SHIPPING:
    "div.market-info-list-cont > div > p:nth-child(1) > span:last-child",
  CATEGORY: "div.market-info-list-cont > div > p:nth-child(1) > span.category",
  THUMBNAIL: "div.thumb-wrap > a > img",
} as const;

const getSaleInfo = async () => {
  const list: TSaleInfo[] = [];
  try {
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0"
    );
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await sleep(5000);
    const html = await page.content();

    await browser.close();
    const $ = load(html);
    $(SELECTER.TABLE)
      .children("tbody")
      .each((_, el) => {
        $(el)
          .find(SELECTER.ROW)
          .each((_, el) => {
            const title = $(el).find(SELECTER.TITLE).text();
            const thumbnail = $(el).find(SELECTER.THUMBNAIL).attr("src");
            const url = $(el).find(SELECTER.URL).attr("href");
            const cost = $(el).find(SELECTER.COST).text();
            const shipping = $(el).find(SELECTER.SHIPPING).text();
            const category = $(el).find(SELECTER.CATEGORY).text();

            list.push({
              title,
              url: `${ORIGIN}${url}`,
              cost,
              shipping,
              category,
              thumbnail: thumbnail?.includes("http")
                ? thumbnail
                : `${ORIGIN}${thumbnail}`,
            });
          });
      });
  } catch (e) {
    console.error(e);
  } finally {
    return list;
  }
};

export default getSaleInfo;
