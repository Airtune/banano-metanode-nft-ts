import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { INanoBlock } from 'nano-account-crawler/dist/nano-interfaces';
import { bananode } from '../src/bananode';
import { SupplyBlocksCrawler } from '../src/supply-blocks-crawler';
import { TBlockHash } from '../src/types/banano';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('SupplyBlocksCrawler', () => {
  let supplyBlocksCrawler1sux: SupplyBlocksCrawler;
  let supplyBlocks1sux: INanoBlock[];
  let supplyBlockHashes1sux: TBlockHash[];


  before("run supplyBlocksCrawler", async () => {
    supplyBlocksCrawler1sux = new SupplyBlocksCrawler(bananode, "ban_1sux9e4wz3drie3csujan6fkdqoi7otumxkcy4gnh4tz1dihp4j7bx46uoes");
    supplyBlocks1sux = await supplyBlocksCrawler1sux.crawl();
    supplyBlockHashes1sux = supplyBlocks1sux.map((supplyBlock) => { return supplyBlock.hash; });
  });
  
  it("registers change#supply blocks followed by a valid mint block", async () => {
    throw Error("not implemented");
  });

  it("doesn't register a supply block if it's the frontier block of an account", async () => {
    const supplyBlocksCrawler = new SupplyBlocksCrawler(bananode, "ban_11nriprqsrt3tag5h1t81s1588noncoseusmuda79u3pcrbydeobtsxun1r1");
    const supplyBlock: INanoBlock[] = await supplyBlocksCrawler.crawl();
    const supplyBlocksHashes: TBlockHash[] = supplyBlock.map((supplyBlock) => { return supplyBlock.hash; });
    expect(supplyBlocksHashes).to.not.include("4837E7DF43A8B8C8507411E575A5421BFC7D1707F0860129B6A09BF6BF8ABAB5");
  });

  it("doesn't detect change#supply block with supported meta protocol v1.0.0 followed by change#supply block", async () => {
    expect(supplyBlockHashes1sux).to.not.include("E8AE3558F4AF0F02492D27226A8D20AEF1131E0EF0D397407534D3FE3FFDB6CC");
  });

  it("doesn't detect change#supply block with unsupported meta protocol v0.0.0 followed by change#supply block", async () => {
    expect(supplyBlockHashes1sux).to.not.include("1B78DA35BE3911D1C00C11E0D2F66E21458DAD7BD912F613B90126FDBB54A82B");
  });

  it("doesn't detect change#supply block with unsupported meta protocol v0.0.0 followed by change#mint block", async () => {
    expect(supplyBlockHashes1sux).to.not.include("EBC92C6A42AB430051AF13EE830DBB07BB6F3F864621F5AC1A952BD16C5B3AF6");
  });

  it("doesn't detect change#supply blocks that doesn't match the header exactly", async () => {
    // Header incorrectly set to "51BACEED607800000F" / "ban_1nftsupp1y11119"
    expect(supplyBlockHashes1sux).to.not.include("9649A724FCC22B1763F8AE043A4FA092218746191C5FD9EDE280A96CFBEB7815");
  });

  it("cancels change#supply block if it's followed by a block with a cancel_supply_representative", async () => {
    throw Error("not implemented");
  });

  it("cancels change#supply block if it's followed by a block with the finished_supply_representative header", async () => {
    throw Error("not implemented");
  });

  it("cancels change#supply block if it's followed by a block with the atomic_swap_representative header", async () => {
    throw Error("not implemented");
  });

  it("doesn't register a send block with a supply representative as a valid supply block", async () => {
    throw Error("not implemented");
  });

  it("doesn't register a receive block with a supply representative as a valid supply block", async () => {
    throw Error("not implemented");
  });
});
