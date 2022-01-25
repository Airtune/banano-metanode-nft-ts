import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { bananode } from '../src/bananode';
import { MintBlocksCrawler } from "../src/mint-blocks-crawler";
import { TAccount, TBlockHash } from '../src/types/banano';
import { INanoBlock } from 'nano-account-crawler/dist/nano-interfaces';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('MintBlocksCrawler', function() {
  let mintBlocksCrawler3mint9: MintBlocksCrawler;
  let mintBlocks3mint9: INanoBlock[];
  let mintBlockHashes3mint9: TBlockHash[];

  let infMintBlocksCrawler3mint9: MintBlocksCrawler;
  let infMintBlocks3mint9: INanoBlock[];
  let infMintBlockHashes3mint9: TBlockHash[];

  before("run mintBlocksCrawler3mint9", async () => {
    const issuer: TAccount = "ban_3mint9uhtn84io1817o7qnxnm1outy7oas3b6b5upg91mw3oghzctpeeqa17";
    const mintBlockHash: TBlockHash = "27A39C5ECEF85B212E0EB35BA59D0D1CB6C818C11FE767EC1184E6B797792EFF";
    mintBlocksCrawler3mint9 = new MintBlocksCrawler(bananode, issuer, mintBlockHash);
    await mintBlocksCrawler3mint9.crawl();
    mintBlocks3mint9 = mintBlocksCrawler3mint9.mintBlocks;
    mintBlockHashes3mint9 = mintBlocks3mint9.map((block) => { return block.hash; });

    const infMintBlockHash: TBlockHash = "2B1C66889A476CE2AABCBC56483B3E7027A43179DBE123225204BCCE02D52115";
    infMintBlocksCrawler3mint9 = new MintBlocksCrawler(bananode, issuer, infMintBlockHash);
    await infMintBlocksCrawler3mint9.crawl();
    infMintBlocks3mint9 = infMintBlocksCrawler3mint9.mintBlocks;
    infMintBlockHashes3mint9 = infMintBlocks3mint9.map((block) => { return block.hash; });
  });

  it("doesn't detect any mints if the change#supply block is the frontier of an account", async () => {
    const supplyBlockHash: TBlockHash = "4837E7DF43A8B8C8507411E575A5421BFC7D1707F0860129B6A09BF6BF8ABAB5";
    const issuer: TAccount = "ban_11nriprqsrt3tag5h1t81s1588noncoseusmuda79u3pcrbydeobtsxun1r1";
    const mintBlocksCrawler = new MintBlocksCrawler(bananode, issuer, supplyBlockHash);
    await mintBlocksCrawler.crawl();
    const mintBlocks: INanoBlock[] = mintBlocksCrawler.mintBlocks;
    const mintBlocksHashes: TBlockHash[] = mintBlocks.map((block) => { return block.hash; });
    expect(mintBlocksHashes).to.be.empty;
  });

  // metadataRepresentative doesn't refer to real IPFS data and is just random for this test
  it("registers mints at block height above the change#supply block", async () => {
    expect(mintBlockHashes3mint9).to.include("9753C757BB36D9A0E572E8E384544CBAFF4F1A92A0BC1E604EA5878865319B93");
  });

  // metadataRepresentative doesn't refer to real IPFS data and is just random for this test
  it("doesn't register mints at block height below the change#supply block", async () => {
    expect(mintBlockHashes3mint9).to.not.include("BB8F75EB2580546F0E3B1C250FD7C04E32BFFD0CCAF97E228F851EE8B30C4A2F");
  });

  it("registers change#mint block for infinite supply", async () => {
    expect(infMintBlockHashes3mint9).to.include("961A2E9FBD620E3FF9AAF4CF377D424A42069A5F19110543A432786CC48F7E18");
  });

  it("registers send#mint block for infinite supply", async () => {
    expect(infMintBlockHashes3mint9).to.include("8C38DF445649C0F1D4AF76894B07AA49632BC02A60B1B0B73AA75E6E15F5CC6C");
  });

  it("doesn't register receive block with metadataRepresentative as a mint block for infinite supply", async () => {
    expect(infMintBlockHashes3mint9).to.not.include("2360902794C6A2A35C2376E71AD37701191ACD00572821C27AC417757CC1315D");
  });

  it("doesn't register mints after the change#finish_supply block for unlimited supply", async () => {
    expect(infMintBlockHashes3mint9).to.not.include("9D63A667BC0BF865CCEDC68542678B42AC00223F999629AFAD5CF63F72DD011B");
  });

  it("is unaffected by change#finish_supply blocks for other supply blocks", async () => {
    throw Error("not implemented");
  });

  it("registers change#mint block below max supply", async () => {
    throw Error("not implemented");
  });

  it("registers send#mint block below max supply", async () => {
    throw Error("not implemented");
  });

  it("doesn't register receive block with metadataRepresentative as a mint block for limited supply", async () => {
    throw Error("not implemented");
  });

  it("doesn't register mints after the change#finish_supply block even if mints are below max supply", async () => {
    throw Error("not implemented");
  });
});
