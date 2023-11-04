import puppeteer, { Browser } from 'puppeteer';
import { Page } from './Crawler';
import { TaskCacheManager } from './TaskCacheManager';

export enum WorkType {
  HTML = 0,
  MarKDown = 1,
}

export interface Task {
  type: WorkType;
  meta: Page;
}

export interface TaskResult {
  data: Buffer;
  meta: Page;
}

export interface CrawlWorkerOptions {
  browser: Browser;
}

export interface CrawlWorker {
  run(task: Task, options: CrawlWorkerOptions): Promise<TaskResult>;
}

export type WorkerFactory = () => CrawlWorker;

interface PoolUnit {
  workers: CrawlWorker[];
  taskQueue: { task: Task; resolve: (value: any) => void }[];
}

export class WorkerManager {
  public cacheManager = new TaskCacheManager('.cache');

  public static factories: Map<WorkType, WorkerFactory> = new Map();

  public workerPool: Map<WorkType, PoolUnit> = new Map();

  public browser?: Browser;

  constructor(public maxWroker: number) {}

  async init() {
    this.browser = await puppeteer.launch({ headless: true, protocolTimeout: 5400000 });
  }

  async destory() {
    this.browser?.close();
  }

  scheduleNextTask(unit: PoolUnit, idleWorker: CrawlWorker) {
    const t = unit.taskQueue.shift();
    if (t) {
      const data = this.cacheManager.get(t.task);
      if (data) {
        t.resolve({
          data,
          meta: t.task.meta,
        });
        this.scheduleNextTask(unit, idleWorker);
      } else {
        t.resolve(
          idleWorker
            .run(t.task, { browser: this.browser as Browser })
            .then((res) => {
              this.cacheManager.set(t.task, res.data);
              this.scheduleNextTask(unit, idleWorker);
              return res;
            })
            .catch((err) => {
              this.scheduleNextTask(unit, idleWorker);
              throw err;
            }),
        );
      }
    } else {
      const index = unit.workers.indexOf(idleWorker);
      unit.workers.splice(index, 1);
    }
  }

  async disatchTask(task: Task) {
    const factory = WorkerManager.factories.get(task.type);
    if (!factory) {
      throw new Error(`no supper work type: ${task.type}`);
    }
    let unit = this.workerPool.get(task.type) as PoolUnit;
    if (!unit) {
      unit = { workers: [], taskQueue: [] };
      this.workerPool.set(task.type, unit);
    }
    return new Promise<TaskResult>((resolve) => {
      unit.taskQueue.push({ task, resolve });
      if (unit.workers.length < this.maxWroker) {
        const newWorker = factory();
        unit.workers.push(newWorker);
        this.scheduleNextTask(unit, newWorker);
      }
    });
  }

  static register(workeryType: WorkType, factory: WorkerFactory) {
    this.factories.set(workeryType, factory);
  }
}
