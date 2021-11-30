import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { bananode } from '../src/bananode';
import { SupplyBlocksCrawler } from '../src/supply-blocks-crawler';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('SupplyBlocksCrawler', function() {
  it("doesn't detect supply block as confirmed if it's the frontier block", async () => {
    throw Error("not implemented");
    const issuer = "ban_missing";
    const supplyBlockCrawler = new SupplyBlocksCrawler(bananode, issuer);
    const supplyBlocks = await supplyBlockCrawler.crawl();
  });

  it("finds supply blocks with a mint block", async () => {
    throw Error("not implemented");
    const issuer = "ban_missing";
    const supplyBlockCrawler = new SupplyBlocksCrawler(bananode, issuer);
  });

  it("cancels #supply block if it's followed by another #supply block", async () => {
    throw Error("not implemented");
  });

  it("cancels #supply block if it's followed by a #cancel_supply", async () => {
    throw Error("not implemented");
  });
});
