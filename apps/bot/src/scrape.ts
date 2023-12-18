import { load } from 'cheerio';
import puppeteer from 'puppeteer-core';

import type { HotDeal } from '@/types';

export const scrapeHotDeals = async () => {
  const html = await getHTML(DEST_URL);
  return parseHotDealList(html);
};

const getHTML = async (dest: string) => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.BROWSER_WS_ENDPOINT,
  });
  const page = await browser.newPage();
  await page.goto(dest);
  await Promise.race([
    page.waitForSelector(SELECTOR.ROW),
    page.waitForNetworkIdle({ idleTime: 1000, timeout: 5000 }),
  ]);
  const html = await page.content();
  await browser.close();

  return html;
};

const parseHotDealList = (html: string) => {
  const origin = new URL(DEST_URL).origin;
  const $ = load(html);
  const hotDeals: HotDeal[] = [];

  $(SELECTOR.ROW).each((_, el) => {
    const title = $(el).find(SELECTOR.TITLE).text();
    const thumbnail = $(el).find(SELECTOR.THUMBNAIL).attr('src') ?? '';
    const url = $(el).find(SELECTOR.URL).attr('href') ?? '';
    const cost = $(el).find(SELECTOR.COST).text();
    const shipping = $(el).find(SELECTOR.SHIPPING).text();
    const category = $(el).find(SELECTOR.CATEGORY).text();

    hotDeals.push({
      title,
      url: `${origin}${url}`,
      cost,
      shipping,
      category,
      thumbnail: thumbnail.includes('http') ? thumbnail : `${origin}${thumbnail}`,
    });
  });

  return hotDeals.reverse();
};

const DEST_URL = 'https://quasarzone.com/bbs/qb_saleinfo';

const SELECTOR = Object.freeze({
  ROW: 'div.market-info-list',
  TITLE: 'span.ellipsis-with-reply-cnt',
  URL: 'p > a',
  COST: 'div.market-info-sub > p:nth-child(1) > span:nth-child(2) > span',
  SHIPPING: 'div.market-info-sub > p:nth-child(1) > span:last-child',
  CATEGORY: 'span.category',
  THUMBNAIL: 'img.maxImg',
});
