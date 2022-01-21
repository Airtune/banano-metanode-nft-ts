import { Mutex } from 'async-mutex';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { MutexManager } from '../../src/lib/mutex-manager';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('MutexManager', function() {
  it('leaves no garbage behind', async () => {
    let mutexManager = new MutexManager();
    let mutexID = "ban_test";

    await expect(mutexManager["mutexByID"][mutexID]).to.be.undefined;

    let run1 = mutexManager.runExclusive(mutexID, async () => {});
    let run2 = mutexManager.runExclusive(mutexID, async () => {
      // sleep 500ms
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    
    await run1;
    // expect mutex lock for run2 to still exist
    await expect(mutexManager["mutexByID"][mutexID]).to.be.instanceof(Mutex);

    await run2;
    // mutex should be cleared by now
    await expect(mutexManager["mutexByID"][mutexID]).to.be.undefined;
  });
});
