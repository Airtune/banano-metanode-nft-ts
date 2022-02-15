import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { bananode } from '../src/bananode';
import { SupplyBlocksCrawler } from '../src/supply-blocks-crawler';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('AssetCrawler', function() {
  it("transfers ownership with send2#asset after the receive block (for send1#mint) has been confirmed", async () => {

  });

  it("transfers ownership with send2#asset after the receive block (for send1#asset) has been confirmed", async () => {

  });

  it("ignores send2#asset before the receive block (for send1#mint) has been confirmed", async () => {

  });

  it("ignores send2#asset before the receive block (for send1#asset) has been confirmed", async () => {

  });

  it("ignores send#asset block for asset you have already sent with a send#asset block", async () => {
    throw Error("not implemented");
  });

  it("ignores send#asset block for asset you have already sent with a send#mint block", async () => {
    throw Error("not implemented");
  });

  it("ignores send#asset blocks before the supply and mint blocks", async () => {
    throw Error("not implemented");
  });

  it("ignores send#mint blocks before the supply and mint blocks", async () => {
    throw Error("not implemented");
  });

  it("tracks several valid sends and receives for an asset", async () => {

  });

  it("cancels atomic swap if receive#atomic_swap block has a different representative than previous block", async () => {
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
