import { expect } from 'chai';
import * as fetch from 'node-fetch';
import { NanoNode } from '../src/nano-node';
import { NanoAccountCrawler } from '../src/nano-account-crawler';

const bananode = new NanoNode('https://kaliumapi.appditto.com/api', fetch);
const account = 'ban_1iw8sa3o57s6iso15hhzrs8todje1c3c5fcjwmneab7nz1o6d781cxxtddaf';
const previous = '2DA1AE13457652BC5136DF83E05CB959A6EF5BCAED83E64978FD2B2D8080020A';

describe('NanoAccountCrawler', function() {
  this.timeout(20000);
  it('for await iterator on NanoAccountCrawler', async () => {
    const banCrawler = new NanoAccountCrawler(bananode, account, previous);
    await banCrawler.initialize();

    let expectedPrevious = previous;
    for await (const block of banCrawler) {
      expect(block.previous).to.equal(expectedPrevious);
      expectedPrevious = block.hash;
    }
  });
});
