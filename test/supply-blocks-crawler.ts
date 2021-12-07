import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { bananode } from '../src/bananode';
import { SupplyBlocksCrawler } from '../src/supply-blocks-crawler';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('SupplyBlocksCrawler', function() {
  it("registers change#supply blocks followed by a valid mint block", async () => {
    throw Error("not implemented");
    const issuer = "ban_missing";
    const supplyBlockCrawler = new SupplyBlocksCrawler(bananode, issuer);
  });

  it("doesn't register a supply block if it's the frontier block of an account", async () => {
    throw Error("not implemented");
    const issuer = "ban_missing";
    const supplyBlockCrawler = new SupplyBlocksCrawler(bananode, issuer);
    const supplyBlocks = await supplyBlockCrawler.crawl();
  });

  it("doesn't detect change#supply blocks with an unsupported version", async () => {
    throw Error("not implemented");
  });

  it("doesn't detect change#supply blocks that doesn't match the header exactly", async () => {
    throw Error("not implemented");
  });

  it("cancels change#supply block if it's followed by a block with the supply representative header", async () => {
    throw Error("not implemented");
  });

  it("cancels change#supply block if it's followed by a block with a cancel supply representative", async () => {
    throw Error("not implemented");
  });

  it("doesn't register a send block with a supply representative as a valid supply block", async () => {
    throw Error("not implemented");
  });

  it("doesn't register a receive block with a supply representative as a valid supply block", async () => {
    throw Error("not implemented");
  });
});
