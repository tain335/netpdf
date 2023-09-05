import puppeteer, { Browser } from 'puppeteer';
import { Page } from './Crawler';

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
  public static factories: Map<WorkType, WorkerFactory> = new Map();

  public workerPool: Map<WorkType, PoolUnit> = new Map();

  public browser?: Browser;

  constructor(public maxWroker: number) {}

  async init() {
    this.browser = await puppeteer.launch({ headless: true });
  }

  async destory() {
    this.browser?.close();
  }

  scheduleNextTask(unit: PoolUnit, worker: CrawlWorker) {
    const t = unit.taskQueue.shift();
    if (t) {
      t.resolve(
        worker.run(t.task, { browser: this.browser as Browser }).then((res) => {
          this.scheduleNextTask(unit, worker);
          return res;
        }),
      );
    } else {
      const index = unit.workers.indexOf(worker);
      unit.workers.splice(index, 1);
    }
  }

  async disatchTask(task: Task) {
    const factory = WorkerManager.factories.get(task.type);
    if (!factory) {
      throw new Error(`no supper work type: ${task.type}`);
    }
    let unit = this.workerPool.get(task.type);
    if (!unit) {
      unit = { workers: [], taskQueue: [] };
      this.workerPool.set(task.type, unit);
    }
    if (unit.workers.length < this.maxWroker) {
      const newWorker = factory();
      unit.workers.push(newWorker);
      const result = await newWorker.run(task, { browser: this.browser as Browser });
      this.scheduleNextTask(unit, newWorker);
      return result;
    }
    return new Promise<TaskResult>((resolve) => {
      unit?.taskQueue.push({ task, resolve });
    });
  }

  static register(workeryType: WorkType, factory: WorkerFactory) {
    this.factories.set(workeryType, factory);
  }
}
