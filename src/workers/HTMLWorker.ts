import { Page } from 'puppeteer';
import { CrawlWorker, CrawlWorkerOptions, Task } from './WorkerManager';

export async function mockScroll(page: Page, region: string) {
  page.exposeFunction('waitForNetworkIdle', () => {
    return page.waitForNetworkIdle({ timeout: 3000 });
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
              window
                // @ts-ignore
                .waitForNetworkIdle()
                .then(() => {
                  resolve(null);
                })
                .catch(() => {
                  resolve(null);
                });
              return;
            }
            window
              // @ts-ignore
              .waitForNetworkIdle()
              .then(() => {
                iter();
              })
              .catch((err: any) => {
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
    await page.setCookie(
      {
        name: 'sessionid',
        value: '6f65ea5d9c85a9cdbddb7c733441d7d6',
        domain: '.juejin.cn',
      },
      {
        name: 'sessionid_ss',
        value: '6f65ea5d9c85a9cdbddb7c733441d7d6',
        domain: '.juejin.cn',
      },
      {
        name: 'msToken',
        value:
          'eq5wG62IJ3bOu--QQuSXp4ux-1IlttpQhLJW7FqPqLchWUHLT1xFbSYn5p3tFXN-3FbVIE8e1JuL4KcLpa_h9VMztBwHb6PBW02Wa71eR0uZEptPkHbXQMjhn6XbtEps',
        domain: '.juejin.cn',
      },
      {
        name: 'csrf_session_id',
        value: 'ac9cb52c14be7ad4897f69ee1d693c3e',
        domain: 'api.juejin.cn',
      },
      {
        name: 'sid_guard',
        value: '6f65ea5d9c85a9cdbddb7c733441d7d6%7C1687917838%7C31536000%7CThu%2C+27-Jun-2024+02%3A03%3A58+GMT',
        domain: '.juejin.cn',
      },
    );
    await page.setExtraHTTPHeaders({
      'X-Secsdk-Csrf-Token':
        '000100000001011553046206739c8a7b39b1e2f5e39e559e940f78f3038566078176be6ceec5179a8275b769f261',
    });
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
      console.log('worker: ', ...args);
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
