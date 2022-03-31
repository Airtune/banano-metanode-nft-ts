import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { AssetCrawler } from '../src/asset-crawler';
import { bananode } from '../src/bananode';
import { getBlock } from '../src/lib/get-block';
import { TAccount } from '../src/types/banano';
import { IAssetBlock } from '../src/interfaces/asset-block';

chai.use(chaiAsPromised);
const expect = chai.expect;


describe('AssetCrawler', function() {
  it("confirms change#mint, send#asset, receive#asset", async () => {
    let issuer: TAccount = "ban_1ty5s13h9tg9f57gwsto8njkzejfu9tjasc8a9mn1wujfxib8dj7w54jg3qm";
    let recipient: TAccount = "ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf";
    let mintBlockHash = "F61CCF94D6E5CFE9601C436ACC3976AF876D1DA21909FEB88B629BEDEC4DF1EA";
    let mintBlock = await getBlock(issuer, mintBlockHash);
    let assetCrawler = new AssetCrawler(bananode, issuer, mintBlock);
    await assetCrawler.crawl();
    let assetFrontier: IAssetBlock = assetCrawler.frontier;
    expect(assetFrontier.account).to.equal(recipient);
    expect(assetFrontier.owner).to.equal(recipient);
    expect(assetFrontier.state).to.equal("owned");
    expect(assetFrontier.type).to.equal("receive#asset");
    expect(assetFrontier.locked).to.equal(false);
  });

  it("confirms send#mint, receive#asset", async () => {
    let issuer: TAccount = "ban_1ty5s13h9tg9f57gwsto8njkzejfu9tjasc8a9mn1wujfxib8dj7w54jg3qm";
    let recipient: TAccount = "ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf";
    let mintBlockHash = "EFE6CCFDE4FD56E60F302F22DCF41E736F611124E3F463135FDC31769A68B970";
    let mintBlock = await getBlock(issuer, mintBlockHash);
    let assetCrawler = new AssetCrawler(bananode, issuer, mintBlock);
    await assetCrawler.crawl();
    let assetFrontier: IAssetBlock = assetCrawler.frontier;
    expect(assetFrontier.account).to.equal(recipient);
    expect(assetFrontier.owner).to.equal(recipient);
    expect(assetFrontier.state).to.equal("owned");
    expect(assetFrontier.type).to.equal("receive#asset");
    expect(assetFrontier.locked).to.equal(false);
  });

  it("unreceived change#mint, send#asset is owned by recipient but not sendable", async () => {
    let issuer: TAccount = "ban_1ty5s13h9tg9f57gwsto8njkzejfu9tjasc8a9mn1wujfxib8dj7w54jg3qm";
    let recipient: TAccount = "ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf";
    let mintBlockHash = "88A047DA0CF8A07568D8E3BEC6030587988A11581906CBBF372DE32385F35F16";
    let mintBlock = await getBlock(issuer, mintBlockHash);
    let assetCrawler = new AssetCrawler(bananode, issuer, mintBlock);
    await assetCrawler.crawl();
    let assetFrontier: IAssetBlock = assetCrawler.frontier;
    expect(assetFrontier.account).to.equal(issuer);
    expect(assetFrontier.owner).to.equal(recipient);
    expect(assetFrontier.state).to.equal("receivable");
    expect(assetFrontier.type).to.equal("send#asset");
    expect(assetFrontier.locked).to.equal(false);
  });

  it("unreceived send#mint is owned by recipient but not sendable", async () => {
    let issuer: TAccount = "ban_1ty5s13h9tg9f57gwsto8njkzejfu9tjasc8a9mn1wujfxib8dj7w54jg3qm";
    let recipient: TAccount = "ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf";
    let mintBlockHash = "D051A922C775616CADC97EB29FD6D75AA514D05ABA4A1252F8B626C9C4F863E8";
    let mintBlock = await getBlock(issuer, mintBlockHash);
    let assetCrawler = new AssetCrawler(bananode, issuer, mintBlock);
    await assetCrawler.crawl();
    let assetFrontier: IAssetBlock = assetCrawler.frontier;
    expect(assetFrontier.account).to.equal(issuer);
    expect(assetFrontier.owner).to.equal(recipient);
    expect(assetFrontier.state).to.equal("receivable");
    expect(assetFrontier.type).to.equal("send#mint");
    expect(assetFrontier.locked).to.equal(false);
  });

  it("is unable to send assets owned by someone else", async () => {
    let issuer: TAccount = "ban_1ty5s13h9tg9f57gwsto8njkzejfu9tjasc8a9mn1wujfxib8dj7w54jg3qm";
    let unrelatedAccount1: TAccount = "ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf";
    let unrelatedAccount2: TAccount = "ban_1oozinhbrw7nrjfmtq1roybi8t7q7jywwne4pjto7oy78injdmn4n3a5w5br";
    let mintBlockHash = "777B8264AFDF004C77285CBBA7F208D2BB5A64118FBB5DCCA7D2619374CB3C4A";
    let mintBlock = await getBlock(issuer, mintBlockHash);
    let assetCrawler = new AssetCrawler(bananode, issuer, mintBlock);
    await assetCrawler.crawl();

    expect(assetCrawler.frontier.owner).to.equal(issuer);

    let assetChain: IAssetBlock[] = assetCrawler.assetChain;
    for (let i = 0; i < assetChain.length; i++) {
      const assetBlock: IAssetBlock = assetChain[i];
      expect(assetBlock.account).to.not.equal(unrelatedAccount1);
      expect(assetBlock.account).to.not.equal(unrelatedAccount2);
      expect(assetBlock.owner).to.not.equal(unrelatedAccount1);
      expect(assetBlock.owner).to.not.equal(unrelatedAccount2);
      expect(assetBlock.nanoBlock.hash).to.not.equal("3F39BE1635C5ECB85741BDE22C879484DE67832F8E140678D3B3C25D42C081FB");
      expect(assetBlock.nanoBlock.hash).to.not.equal("CAE3296E2AC94C18DFEFAA29D4EAD828108ACC3F1C2B0789868E064F596A71A3");
    }
  });

  it("ignores send#asset block for asset you have already sent with a send#mint block", async () => {
    let issuer: TAccount = "ban_1ty5s13h9tg9f57gwsto8njkzejfu9tjasc8a9mn1wujfxib8dj7w54jg3qm";
    let mintBlockHash = "6F7ED78C5A40145EDCA76B63B1F525DC38A6A4597D59274FBEEED32619C8AF43";
    let mintBlock = await getBlock(issuer, mintBlockHash);
    let assetCrawler = new AssetCrawler(bananode, issuer, mintBlock);
    await assetCrawler.crawl();

    expect(assetCrawler.frontier.owner).to.not.equal("ban_1oozinhbrw7nrjfmtq1roybi8t7q7jywwne4pjto7oy78injdmn4n3a5w5br");
    expect(assetCrawler.frontier.owner).to.equal("ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf");
  });

  it("traces chain of sends", async () => {
    let issuer: TAccount = "ban_1ty5s13h9tg9f57gwsto8njkzejfu9tjasc8a9mn1wujfxib8dj7w54jg3qm";
    // send#mint
    let mintBlockHash = "87F0D105A36BA43C87AF399B84B8BBF8EED0BDD71279AACC33496809D5E28B66";
    let mintBlock = await getBlock(issuer, mintBlockHash);
    let assetCrawler = new AssetCrawler(bananode, issuer, mintBlock);
    await assetCrawler.crawl();

    expect(assetCrawler.assetChain.length).to.equal(4);
    expect(assetCrawler.assetChain[0].type).to.equal("send#mint");
    expect(assetCrawler.assetChain[0].state).to.equal("receivable");
    expect(assetCrawler.assetChain[0].account).to.equal(issuer);
    expect(assetCrawler.assetChain[0].owner).to.equal("ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf");

    expect(assetCrawler.assetChain[1].type).to.equal("receive#asset");
    expect(assetCrawler.assetChain[1].state).to.equal("owned");
    expect(assetCrawler.assetChain[1].account).to.equal("ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf");
    expect(assetCrawler.assetChain[1].owner).to.equal("ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf");

    expect(assetCrawler.assetChain[2].type).to.equal("send#asset");
    expect(assetCrawler.assetChain[2].state).to.equal("receivable");
    expect(assetCrawler.assetChain[2].account).to.equal("ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf");
    expect(assetCrawler.assetChain[2].owner).to.equal("ban_1oozinhbrw7nrjfmtq1roybi8t7q7jywwne4pjto7oy78injdmn4n3a5w5br");

    expect(assetCrawler.assetChain[3].type).to.equal("receive#asset");
    expect(assetCrawler.assetChain[3].state).to.equal("owned");
    expect(assetCrawler.assetChain[3].account).to.equal("ban_1oozinhbrw7nrjfmtq1roybi8t7q7jywwne4pjto7oy78injdmn4n3a5w5br");
    expect(assetCrawler.assetChain[3].owner).to.equal("ban_1oozinhbrw7nrjfmtq1roybi8t7q7jywwne4pjto7oy78injdmn4n3a5w5br");

    expect(assetCrawler.frontier.owner).to.equal("ban_1oozinhbrw7nrjfmtq1roybi8t7q7jywwne4pjto7oy78injdmn4n3a5w5br");
  });

  it("ignores send#asset before the receive block for the asset has been confirmed", async () => {
    throw Error("not implemented");
  });

  it("ignores send#asset block for asset you have already sent with a send#asset block", async () => {
    throw Error("not implemented");
  });

  it("ignores send#mint blocks before the supply and mint blocks", async () => {
    throw Error("not implemented");
  });

  it("tracks several valid sends and receives for an asset", async () => {
    throw Error("not implemented");
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
