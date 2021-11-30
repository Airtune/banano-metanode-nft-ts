import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { bananode } from '../src/bananode';
import { SupplyBlocksCrawler } from '../src/supply-blocks-crawler';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('AssetCrawler', function() {
  it("can't send asset you have already sent", async () => {
    throw Error("not implemented");
  });

  it("can't send asset before you receive it", async () => {
    throw Error("not implemented");
  });

  it("can't send asset before the change#mint block", async () => {
    throw Error("not implemented");
  });

  it("can't send asset before the supply block", async () => {
    throw Error("not implemented");
  });

  it("sends an asset from the send#mint block", async () => {
    throw Error("not implemented");
  });

  it("cancels atomic swap if receive#atomic_swap block changes representative", async () => {
    // Todo: check if there's other variables that can change the block hash to break the atomic swap
    throw Error("not implemented");
  });

  it("cancels atomic swap if a block other than the relevant receive#atomic_swap is confirmed at receive_height", async () => {
    throw Error("not implemented");
  });

  it("cancels atomic swap if a block other than send#payment follows receive#atomic_swap", async () => {
    throw Error("not implemented");
  });

  it("cancels atomic swap if send#payment sends too little raw", async () => {
    throw Error("not implemented");
  });

  it("cancels atomic swap if send#payment sends to the wrong account", async () => {
    throw Error("not implemented");
  });
});
