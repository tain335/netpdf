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
      {
        type: WorkType.HTML,
        entries: [
          {
            url: 'https://juejin.cn/column/7062622832886284295',
            includeEntry: false,
            requestInterval: 3000,
            scrollMock: true,
            targetRegion: '.article-list',
            pdfMargin: { top: 40, bottom: 40, left: 40, right: 40 },
            collectPage: (content) => {
              const $ = cheerio.load(content);
              const pages = $('.article-item .title')
                .toArray()
                .map((el) => {
                  return {
                    url: el.attribs.href,
                    title: $(el).text().trim(),
                    targetRegion: '.main-area .article',
                    type: WorkType.HTML,
                    width: 900,
                  };
                });
              console.log('pages.length:', pages.length);
              return pages.filter((item) => !item.url.startsWith('#'));
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
