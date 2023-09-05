import axios, { AxiosInstance } from 'axios';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';
import { PDFMargin } from 'puppeteer';
import { Buffer } from 'buffer';
import path from 'path';
import { Task, TaskResult, WorkType, WorkerManager } from './WorkerManager';
import { HTMLWorker } from './HTMLWorker';
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
  url: string;
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
  timeout: number;
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
    this.workerManager = new WorkerManager(16);
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
        console.error(`page: ${page.url}`);
        throw err;
      });
  }

  async dispatchEntry(type: WorkType, entry: CrawlerEntry) {
    const res = await this.axiosInstance?.get(entry.url, {
      responseType: 'arraybuffer',
    });
    if (res) {
      const contentType = `${res.headers['Content-Type']}` ?? '';

      const result = /charset=([\w-]+)/.exec(contentType);
      let charset = result?.[1];
      const $ = cheerio.load(Buffer.from(res.data).toString('utf-8'));

      if (!charset) {
        charset = $('meta[charset]').attr('charset');
      }

      charset = charset ?? 'utf-8';
      const content = iconv.decode(Buffer.from(res.data), charset);
      let pages = entry.collectPage(content);
      const entryURL = new URL(entry.url);
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
            page.url = path.join(entry.url, page.url);
          }
          return page;
        });
      if (entry.includeEntry) {
        pages.unshift({
          url: entry.url,
          title: $('meta[title]').text() || $('head title').text(),
          type,
          scrollMock: entry.scrollMock,
          width: pages[0]?.width,
          heigh: pages[0]?.heigh,
          pdfMargin: pages[0]?.pdfMargin,
        });
      }
      console.info(`entry: ${entry.url}, tasks: ${pages.length}`);
      let count = 0;
      const tasks: TaskResult[] = [];
      for (const page of pages) {
        if (page.requestInterval) {
          await sleep(page.requestInterval * Math.random());
        }
        tasks.push(await this.dispatchPage(entry, page));
        count++;
        console.info(`page: ${page.url}, completed: ${count}/${pages.length}`);
      }
      return tasks;
    }
    throw new Error(`no response: ${entry.url}`);
  }

  async dispathWork(work: CrawlerWork): Promise<WrokResult> {
    const entriresResults: EntryResult[] = [];
    for (const entry of work.entries) {
      const result = await this.dispatchEntry(work.type, entry);
      entriresResults.push({ title: result[0].meta.title, tasks: result });
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
