import { Page } from 'puppeteer';
import { CrawlWorker, CrawlWorkerOptions, Task } from './WorkerManager';

export async function mockScroll(page: Page, region: string) {
  page.exposeFunction('waitForNetworkIdle', () => {
    return page.waitForNetworkIdle();
  });
  await page.$eval(region, (targetEl) => {
    let domEl = targetEl as HTMLElement;
    if (domEl) {
      while (domEl.scrollHeight === domEl.clientHeight) {
        if (domEl?.parentElement) {
          domEl = domEl.parentElement;
        } else {
          break;
        }
      }
      if (domEl) {
        return new Promise((resolve) => {
          let { scrollTop } = domEl;
          let prevScrollTop = -1;
          const iter = () => {
            if (scrollTop !== prevScrollTop) {
              domEl.scrollTop += domEl.clientHeight / 4;
              prevScrollTop = scrollTop;
              scrollTop = domEl.scrollTop;
            } else {
              // @ts-ignore
              window.waitForNetworkIdle().then(() => {
                resolve(null);
              });
              return;
            }
            // @ts-ignore
            window.waitForNetworkIdle().then(() => {
              iter();
            });
          };
          iter();
        });
      }
    }
    return null;
  });
}

export class HTMLWorker implements CrawlWorker {
  async run(task: Task, { browser }: CrawlWorkerOptions) {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 800,
    });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    );
    await page.goto(task.meta.url);
    await page.waitForNetworkIdle();
    page.on('error', (err) => {
      console.error('page error: ', err);
    });

    page.on('console', async (msg) => {
      const msgArgs = msg.args();
      const args = [];
      for (let i = 0; i < msgArgs.length; ++i) {
        args.push(await msgArgs[i].jsonValue());
      }
    });

    if (task.meta.removeRegions) {
      for (const region of task.meta.removeRegions) {
        await page.$$eval(region, (elements) => {
          elements.forEach((el) => {
            el.remove();
          });
        });
      }
    }

    if (task.meta.targetRegion && task.meta.scrollMock) {
      await mockScroll(page, task.meta.targetRegion);
    }
    if (task.meta.targetRegion) {
      await page.$eval(task.meta.targetRegion, (targetEl) => {
        const setElStyle = (el: HTMLElement, css: string) => {
          const oldStyle = el.getAttribute('style');
          const cssProperties = oldStyle?.split(';') ?? [];
          cssProperties.push(css);
          el.setAttribute('style', cssProperties.join(';'));
        };
        const hideAllIrrelevantEl = (target: HTMLElement) => {
          if (target.tagName === 'BODY' || target.tagName === 'HTML') {
            return;
          }
          const els = Array.from(target.parentElement?.children ?? []);
          els.forEach((el) => {
            if (el !== target) {
              const e = el as HTMLElement;
              if (e.tagName !== 'SCRIPT' && e.tagName !== 'STYLE') {
                setElStyle(e, 'display: none');
              }
            }
          });
          if (target.parentElement) {
            hideAllIrrelevantEl(target.parentElement);
          }
        };
        const resetStyle =
          'position: static; max-width: 900px; width: 900px; flex-basic: 900px;padding: 0; margin: 0 auto';
        const updateParentStyle = (target: HTMLElement) => {
          if (target.tagName === 'BODY' || target.tagName === 'HTML') {
            return;
          }
          setElStyle(target, resetStyle);
          if (target.parentElement) {
            updateParentStyle(target.parentElement as HTMLElement);
          }
        };
        if (targetEl) {
          hideAllIrrelevantEl(targetEl as HTMLElement);
          updateParentStyle(targetEl as HTMLElement);
        }
      });
    }

    await page.waitForNetworkIdle();

    const buffer = await page.pdf({
      margin: task.meta.pdfMargin,
      width: task.meta.width ?? 1200,
      height: task.meta.heigh ?? 1600,
    });
    await page.close();
    return { data: buffer, meta: task.meta };
  }
}
