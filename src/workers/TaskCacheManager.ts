import fsextra from 'fs-extra';
import md5 from 'md5';
import path from 'path';
import { Task, TaskResult } from './WorkerManager';

export class TaskCacheManager {
  constructor(public cacheDir: string) {
    this.init();
  }

  init() {
    fsextra.ensureDirSync(this.cacheDir);
  }

  key(task: Task) {
    const jsonStr = JSON.stringify(task);
    const hash = md5(jsonStr);
    return hash;
  }

  get(task: Task): Buffer | void {
    const hash = this.key(task);
    try {
      const data = fsextra.readFileSync(path.join(this.cacheDir, `${hash}.data`));
      return data;
    } catch (err) {
      //
    }
    return undefined;
  }

  set(task: Task, data: Buffer) {
    const hash = this.key(task);
    fsextra.writeFileSync(path.join(this.cacheDir, `${hash}.data`), data);
  }
}
