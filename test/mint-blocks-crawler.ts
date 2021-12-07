import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { bananode } from '../src/bananode';
import { SupplyBlocksCrawler } from '../src/supply-blocks-crawler';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('MintBlocksCrawler', function() {
  it("doesn't detect any mints if the change#supply block is the frontier of an account", async () => {
    throw Error("not implemented");
  });

  it("registers mints at block height above the change#supply block", async () => {
    throw Error("not implemented");
  });

  it("doesn't register mints at block height below the change#supply block", async () => {
    throw Error("not implemented");
  });

  it("doesn't register invalid mints after the change#finish_supply block for unlimited supply", async () => {
    throw Error("not implemented");
  });

  it("doesn't register invalid mints after the change#finish_supply block even if mints are below max supply", async () => {
    throw Error("not implemented");
  });

  it("doesn't register invalid mints after max supply has been exceeded", async () => {
    throw Error("not implemented");
  });

  it("registers valid mints before max supply has been exceeded", async () => {
    throw Error("not implemented");
  });

  it("is able to detect mints with infinite supply", async () => {
    throw Error("not implemented");
  });
});
