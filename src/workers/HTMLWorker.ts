import fs from 'fs/promises';
import { CrawlWorker, CrawlWorkerOptions, Task } from './WorkerManager';
import { sleep } from '../utils/sleep';

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
      console.log(err);
    });
    page.on('console', async (msg) => {
      const msgArgs = msg.args();
      const args = [];
      for (let i = 0; i < msgArgs.length; ++i) {
        args.push(await msgArgs[i].jsonValue());
      }
      console.log(args);
    });

    page.exposeFunction('waitForNetworkIdle', () => {
      return page.waitForNetworkIdle();
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
    // await page.evaluate(()=> {
    //   window.
    // })

    if (task.meta.targetRegion && task.meta.scrollMock) {
      await page.$eval(task.meta.targetRegion, (targetEl) => {
        let htmlEl = targetEl as HTMLElement;

        if (htmlEl) {
          // console.log(htmlEl.tagName, htmlEl.className, htmlEl.clientHeight, htmlEl.scrollHeight);
          while (htmlEl.scrollHeight === htmlEl.clientHeight) {
            if (htmlEl?.parentElement) {
              htmlEl = htmlEl.parentElement;
              // console.log(htmlEl.tagName, htmlEl.className, htmlEl.clientHeight, htmlEl.scrollHeight);
            } else {
              break;
            }
          }
          if (htmlEl) {
            return new Promise((resolve) => {
              let { scrollTop } = htmlEl;
              let prevScrollTop = -1;
              const iter = () => {
                if (scrollTop !== prevScrollTop) {
                  htmlEl.scrollTop += htmlEl.clientHeight / 4;
                  prevScrollTop = scrollTop;
                  scrollTop = htmlEl.scrollTop;
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
    if (task.meta.targetRegion) {
      // const $targetHandle = await page.$(task.meta.targetRegion);
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
