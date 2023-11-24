import * as cheerio from 'cheerio';
import { Crawler } from './workers/Crawler';
import { WorkType } from './workers/WorkerManager';
import { merge } from './merger/PDFMerger';

(async function () {
  const crawler = new Crawler(
    [
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'https://draveness.me/whys-the-design/',
      //       includeEntry: true,
      //       targetRegion: '.article',
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.article-content a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               width: 1200,
      //               url: el.attribs.href,
      //               title: $(el).text(),
      //               type: WorkType.HTML,
      //             };
      //           });
      //         const filterPages = pages.filter(
      //           (page) =>
      //             page.url.startsWith('https://draveness.me/whys') &&
      //             page.url !== 'https://draveness.me/whys-the-design-mongodb-b-tree/',
      //         );
      //         const map = new Map<string, boolean>();
      //         return filterPages.filter((p) => {
      //           if (!map.get(p.url)) {
      //             map.set(p.url, true);
      //             return true;
      //           }
      //           return false;
      //         });
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'https://zq99299.github.io/note-architect/hc/',
      //       includeEntry: true,
      //       targetRegion: '.page',
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.page a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text(),
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           });
      //         return pages;
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'https://zq99299.github.io/note-book/elasticsearch-core/',
      //       includeEntry: true,
      //       targetRegion: '.page',
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.page a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text(),
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           });
      //         return pages.filter((page) => !page.url.endsWith('README.md'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'https://zq99299.github.io/note-book/elasticsearch-senior/',
      //       includeEntry: true,
      //       targetRegion: '.page',
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.page a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text(),
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           });
      //         return pages.filter((page) => !page.url.endsWith('README.md'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'https://zq99299.github.io/note-book/cache-pdp/#%E7%AC%AC%E4%B8%80%E7%89%88',
      //       includeEntry: true,
      //       targetRegion: '.page',
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.page .theme-default-content :nth-child(7) a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text(),
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           });
      //         return pages;
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'https://www.bookstack.cn/read/webxiaohua-gitbook',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       removeRegions: ['.bookstack-bars'],
      //       targetRegion: '.manual-article',
      //       pdfMargin: { top: 40, bottom: 20 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.article-menu li a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text(),
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           });
      //         return pages.slice(1);
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'https://italink.github.io/ModernGraphicsEngineGuide/01-GraphicsAPI/0.%E6%A6%82%E8%BF%B0/',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: false,
      //       targetRegion: '.md-content',
      //       pdfMargin: { top: 40, bottom: 20 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('nav[aria-labelledby="__nav_3_label"] .md-nav__list .md-nav__item a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           });
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'https://juejin.cn/column/7062622832886284295',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.article-list',
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.article-item .title')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.main-area .article',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           });
      //         console.log('pages.length:', pages.length);
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'https://juejin.cn/column/7284417436752527421',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.article-list',
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.article-item .title')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.main-area .article',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           });
      //         console.log('pages.length:', pages.length);
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'https://juejin.cn/column/7203258813893738556',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.article-list',
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.article-item .title')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.main-area .article',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           });
      //         console.log('pages.length:', pages.length);
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'https://juejin.cn/user/1433418892322119/posts',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.entry-list',
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.entry .title')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.main-area .article',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           });
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'http://www.52im.net/thread-228-1-1.html',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.pcb table',
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.pct table ul a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.pcb table',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           })
      //           .filter((p) => p.url && p.url.includes('http://www.52im.net/thread'));
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'http://www.52im.net/thread-853-1-1.html',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.pcb table',
      //       removeRegions: [],
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.pct table ul a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.pcb table',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           })
      //           .filter((p) => p.url && p.url.includes('http://www.52im.net/thread'));
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'http://www.52im.net/thread-1236-1-1.html',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.pcb table',
      //       removeRegions: [],
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.pct table ul a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.pcb table',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           })
      //           .filter((p) => p.url && p.url.includes('http://www.52im.net/thread'));
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'http://www.52im.net/thread-1289-1-4.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      //     {
      //       url: 'http://www.52im.net/thread-530-1-2.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      //     {
      //       url: 'http://www.52im.net/thread-528-1-2.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      //     {
      //       url: 'http://www.52im.net/thread-1553-1-3.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      //     {
      //       url: 'http://www.52im.net/thread-3875-1-3.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      //     {
      //       url: 'http://www.52im.net/thread-3169-1-3.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      //     {
      //       url: 'http://www.52im.net/thread-3220-1-4.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      //     {
      //       url: 'http://www.52im.net/thread-1564-1-4.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      //     {
      //       url: 'http://www.52im.net/thread-1289-1-4.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      //     {
      //       url: 'http://www.52im.net/thread-1406-1-4.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      //     {
      //       url: 'http://www.52im.net/thread-1465-1-4.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      //     {
      //       url: 'http://www.52im.net/thread-1904-1-5.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      //     {
      //       url: 'http://www.52im.net/thread-875-1-4.html',
      //       targetRegion: '.pcb table',
      //       includeEntry: true,
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: () => [],
      //     },
      // ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'http://www.52im.net/thread-294-1-1.html',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.pcb table',
      //       removeRegions: [],
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.pct table ul a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.pcb table',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           })
      //           .filter((p) => p.url && p.url.includes('http://www.52im.net/thread'));
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'http://www.52im.net/thread-4433-1-1.html',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.pcb table',
      //       removeRegions: [],
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.pct table ul a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.pcb table',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           })
      //           .filter((p) => p.url && p.url.includes('http://www.52im.net/thread'));
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'http://www.52im.net/thread-1998-1-1.html',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.pcb table',
      //       removeRegions: [],
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.pct table ul')
      //           .eq(1)
      //           .find('a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.pcb table',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           })
      //           .filter((p) => p.url && p.url.includes('http://www.52im.net/thread'));
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'http://www.52im.net/thread-216-1-1.html',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.pcb table',
      //       removeRegions: [],
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.pct table .litype_1')
      //           .find('a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.pcb table',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           })
      //           .filter((p) => p.url && p.url.includes('http://www.52im.net/thread'));
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'http://www.52im.net/thread-1243-1-1.html',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.pcb table',
      //       removeRegions: [],
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.pct table .litype_1')
      //           .find('a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.pcb table',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           })
      //           .filter((p) => p.url && p.url.includes('http://www.52im.net/thread'));
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'http://www.52im.net/thread-50-1-1.html',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.pcb table',
      //       removeRegions: [],
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.pct table .litype_1')
      //           .find('a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.pcb table',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           })
      //           .filter((p) => p.url && p.url.includes('http://www.52im.net/thread'));
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'http://www.52im.net/thread-561-1-1.html',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.pcb table',
      //       removeRegions: [],
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.pct table .litype_1')
      //           .find('a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.pcb table',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           })
      //           .filter((p) => p.url && p.url.includes('http://www.52im.net/thread'));
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      // {
      //   type: WorkType.HTML,
      //   entries: [
      //     {
      //       url: 'http://www.52im.net/thread-3134-1-1.html',
      //       includeEntry: false,
      //       requestInterval: 3000,
      //       scrollMock: true,
      //       targetRegion: '.pcb table',
      //       removeRegions: [],
      //       pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
      //       collectPage: (content) => {
      //         const $ = cheerio.load(content);
      //         const pages = $('.pct table ul')
      //           .eq(3)
      //           .find('a')
      //           .toArray()
      //           .map((el) => {
      //             return {
      //               url: el.attribs.href,
      //               title: $(el).text().trim(),
      //               targetRegion: '.pcb table',
      //               type: WorkType.HTML,
      //               width: 900,
      //             };
      //           })
      //           .filter((p) => p.url && p.url.includes('http://www.52im.net/thread'));
      //         return pages.filter((item) => !item.url.startsWith('#'));
      //       },
      //     },
      //   ],
      // },
      {
        type: WorkType.HTML,
        entries: [
          {
            url: 'https://juejin.cn/book/7031893648145186824/section/7031893648199401508',
            includeEntry: false,
            requestInterval: 3000,
            scrollMock: true,
            targetRegion: '.article-content',
            removeRegions: [],
            pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
            collectPage: (content) => {
              return [
                {
                  type: WorkType.HTML,
                  title: '1. 开篇：可视化介绍',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7031893648199401508',
                },
                {
                  type: WorkType.HTML,
                  title: '2. 基础：数据分析模型',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032095221731033125',
                },
                {
                  type: WorkType.HTML,
                  title: '3. 基础：绘制一个条形图',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032124089078644773',
                },
                {
                  type: WorkType.HTML,
                  title: '4. 基础：可视化工具概览',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032124729691471903',
                },
                {
                  type: WorkType.HTML,
                  title: '5. 实战：搭建开发环境',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032124171270225956',
                },
                {
                  type: WorkType.HTML,
                  title: '6. 实战：渲染引擎 - Renderer',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032655970673262629',
                },
                {
                  type: WorkType.HTML,
                  title: '7. 实战：比例尺 - Scale',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032181199338471438',
                },
                {
                  type: WorkType.HTML,
                  title: '8. 实战：坐标系 - Coordinate',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032095221764587550',
                },
                {
                  type: WorkType.HTML,
                  title: '9. 实战：几何图形 - Geometry',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032124402527387655',
                },
                {
                  type: WorkType.HTML,
                  title: '10. 实战：辅助组件 - Guide',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032124432415981576',
                },
                {
                  type: WorkType.HTML,
                  title: '11. 实战：统计 - Statistic',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032124491824103438',
                },
                {
                  type: WorkType.HTML,
                  title: '12. 实战：视图 - View',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7053889628994011169',
                },
                {
                  type: WorkType.HTML,
                  title: '13. 实战：渲染流程 - Plot',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7035640673822834691',
                },
                {
                  type: WorkType.HTML,
                  title: '14. 分析：表格带你浅尝数据分析',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7054011564101206048',
                },
                {
                  type: WorkType.HTML,
                  title: '15. 分析：压抑的中世纪发生了什么？',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7035589314796847107',
                },
                {
                  type: WorkType.HTML,
                  title: '16. 分析：哲学家之间在讨论啥“八卦”？',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032124549563056141',
                },
                {
                  type: WorkType.HTML,
                  title: '17. 分析：抽象的哲学问题又有谁来解？',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032124586674094088',
                },
                {
                  type: WorkType.HTML,
                  title: '18. 分析：哲学流派的“组织架构”是啥样的？',
                  url: 'https://juejin.cn/book/7031893648145186824/section/7032124463390933000',
                },
              ];
            },
          },
        ],
      },
    ],
    { timeout: 5000 },
  );
  await crawler.init();
  const result = await crawler.run();
  console.log('merge pdf...');
  await merge('output.pdf', result);
  console.log('merge pdf completed!');
  await crawler.destory();
})();
