import { Mutex } from 'async-mutex';

export class MutexManager {
  private mainMutex: Mutex;
  private mutexByID: { string: Mutex }; 

  constructor() {
    this.mainMutex = new Mutex();
    this.mutexByID = {} as { string: Mutex };
  }

  async runExclusive(id, func) {
    try {
      // create mutex
      await this.mainMutex.runExclusive(() => {
        if (!(this.mutexByID[id] instanceof Mutex)) {
          this.mutexByID[id] = new Mutex();
        }
      });

      await this.mutexByID[id].runExclusive(func);

      // cleanup mutex
      await this.mainMutex.runExclusive(() => {
        if (!this.mutexByID[id].isLocked()) {
          delete this.mutexByID[id];
        }
      });
    } catch(error) {
      throw(error);
    }
  }
}
