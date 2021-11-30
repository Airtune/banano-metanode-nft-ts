import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { bananode } from '../src/bananode';
import { SupplyBlocksCrawler } from '../src/supply-blocks-crawler';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('MintBlocksCrawler', function() {
  it("doesn't mint any assets if #supply block is the frontier of an account", async () => {
    throw Error("not implemented");
  });

  it("is unable to mint at a block height below the #supply block", async () => {
    throw Error("not implemented");
  });

  it("is unable to mint after #finish_supply block is confirmed for unlimited supply", async () => {
    throw Error("not implemented");
  });

  it("is unable to mint after #finish_supply block is confirmed while still under max supply from #supply block", async () => {
    throw Error("not implemented");
  });

  it("is unable to mint after max supply has been exceeded", async () => {
    throw Error("not implemented");
  });

  it("is able to mint before max supply has been exceeded", async () => {
    throw Error("not implemented");
  });

  it("is able to mint before max supply has been exceeded", async () => {
    throw Error("not implemented");
  });
});
