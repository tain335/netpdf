import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import puppeteer, { PDFMargin } from 'puppeteer';
import path from 'path';
import { writeFileSync } from 'fs';
import { Task, TaskResult, WorkType, WorkerManager } from './WorkerManager';
import { HTMLWorker, mockScroll } from './HTMLWorker';
import { sleep } from '../utils/sleep';
// work -> entry -> page
export interface Page {
  title: string;
  url: string;
  targetRegion?: string;
  scrollMock?: boolean;
  requestInterval?: number;
  width?: number;
  heigh?: number;
  removeRegions?: string[];
  pdfMargin?: PDFMargin;
  type: WorkType;
}

interface CrawlerEntry {
  url: string | string[];
  includeEntry?: boolean;
  scrollMock?: boolean;
  requestInterval?: number;
  targetRegion?: string;
  removeRegions?: string[];
  pdfMargin?: PDFMargin;
  collectPage: (content: string) => Page[];
}

interface CrawlerWork {
  title?: string;
  type: WorkType;
  entries: CrawlerEntry[];
}

interface CrawlerOptions {
  timeout?: number;
  maxWorker?: number;
}

interface EntryResult {
  title?: string;
  tasks: TaskResult[];
}

export interface WrokResult {
  title?: string;
  entries: EntryResult[];
}

export class Crawler {
  public axiosInstance: AxiosInstance;

  public workerManager: WorkerManager;

  constructor(public works: CrawlerWork[], public options: CrawlerOptions) {
    this.axiosInstance = axios.create({
      timeout: this.options.timeout ?? 5000,
    });
    this.workerManager = new WorkerManager(options.maxWorker ?? 4);
  }

  async init() {
    WorkerManager.register(WorkType.HTML, () => new HTMLWorker());
    await this.workerManager.init();
  }

  async destory() {
    await this.workerManager.destory();
  }

  scrawTask(task: Task): Promise<TaskResult> {
    return this.workerManager?.disatchTask(task);
  }

  async dispatchPage(entry: CrawlerEntry, page: Page) {
    return this.scrawTask({
      type: page.type,
      meta: {
        ...page,
        requestInterval: page.requestInterval ?? entry.requestInterval,
        targetRegion: page.targetRegion ?? entry.targetRegion,
        scrollMock: page.scrollMock ?? entry.scrollMock,
        removeRegions: page.removeRegions ?? entry.removeRegions,
        pdfMargin: page.pdfMargin ?? entry.pdfMargin,
      },
    })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.error(`fail page: ${page.url}`);
        console.error(err);
        throw err;
      });
  }

  async dispatchEntry(type: WorkType, entry: CrawlerEntry) {
    const browser = await puppeteer.launch({ headless: true });
    const $page = await browser.newPage();
    await $page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    );
    const urls = Array.isArray(entry.url) ? entry.url : [entry.url];
    let allPages: Page[] = [];
    for (const url of urls) {
      await $page.goto(url);
      await $page.waitForNetworkIdle();
      if (entry.scrollMock) {
        await mockScroll($page, entry.targetRegion ?? '');
      }
      const content = await $page.content();
      // console.log(content);
      writeFileSync('index.html', content);
      let pages = entry.collectPage(content);
      const $ = cheerio.load(content);
      const entryURL = new URL(url);
      pages = pages
        .filter(
          (page) =>
            page.url.startsWith('http://') ||
            page.url.startsWith('https://') ||
            page.url.startsWith('/') ||
            page.url.startsWith('.') ||
            page.url.startsWith('..'),
        )
        .map((page) => {
          if (path.isAbsolute(page.url)) {
            page.url = `${entryURL.protocol}//${entryURL.hostname}${entryURL.port ? `:${entryURL.port}` : ''}${
              page.url
            }`;
          } else if (page.url.startsWith('..') || page.url.startsWith('.')) {
            page.url = path.join(url, page.url);
          }
          return page;
        });
      if (entry.includeEntry) {
        pages.unshift({
          url,
          title: $('meta[title]').text() || $('head title').text(),
          type,
          scrollMock: entry.scrollMock,
          width: pages[0]?.width,
          heigh: pages[0]?.heigh,
          pdfMargin: pages[0]?.pdfMargin,
        });
      }
      allPages = allPages.concat(pages);
    }

    console.info(`entry: ${urls.join(',')}, tasks: ${allPages.length}`);
    await $page.close();
    await browser.close();
    let successCount = 0;
    let failCount = 0;
    const tasks: TaskResult[] = [];
    const promises: Promise<any>[] = [];
    for (const page of allPages) {
      if (page.requestInterval) {
        await sleep(page.requestInterval * Math.random());
      }
      promises.push(
        this.dispatchPage(entry, page)
          .then((res) => {
            tasks.push(res);
            successCount++;
            console.info(
              `page: ${page.url}, success: ${successCount}/${allPages.length}, fail: ${failCount}/${allPages.length}`,
            );
          })
          .catch(() => {
            failCount++;
            console.info(
              `page: ${page.url}, success: ${successCount}/${allPages.length}, fail: ${failCount}/${allPages.length}`,
            );
          }),
      );
    }
    await Promise.all(promises);
    return tasks;
  }

  async dispathWork(work: CrawlerWork): Promise<WrokResult> {
    const entriresResults: EntryResult[] = [];
    for (const entry of work.entries) {
      const result = await this.dispatchEntry(work.type, entry);
      if (result.length) {
        entriresResults.push({ title: result[0].meta.title, tasks: result });
      }
    }
    return {
      title: work.title,
      entries: entriresResults,
    };
  }

  async run() {
    const results: WrokResult[] = [];
    for (const work of this.works) {
      results.push(await this.dispathWork(work));
    }
    return results;
  }
}
