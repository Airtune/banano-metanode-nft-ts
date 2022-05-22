import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { AssetCrawler } from '../src/asset-crawler';
import { bananode } from '../src/bananode';
import { getBlock } from '../src/lib/get-block';
import { TAccount, TBlockHash } from '../src/types/banano';
import { IAssetBlock } from '../src/interfaces/asset-block';
import { INanoBlock } from 'nano-account-crawler/dist/nano-interfaces';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('AssetCrawler', function() {
  this.timeout(5000);
  let issuer: TAccount = "ban_1ty5s13h9tg9f57gwsto8njkzejfu9tjasc8a9mn1wujfxib8dj7w54jg3qm";
  let swapIssuer: TAccount = "ban_1swapxh34bjstbc8c5tonbncw5nrc6sgk7h71bxtetty3huiqcj6mja9rxjt";
  let swapMintBlock;
  let swapAssetCrawler;
  
  // IPFS CID: QmPDFGyV7QKdT4MvV8vhuvPYsDoy66KxqDzB93mpne6tQ5
  // Corresponding Metadata Representative: ban_159p616fwg36pynrh3i4b3p6qg4oxxxemypxgz6ubzid65kbcd4y4kpu5p6b
  before(async () => {
    swapMintBlock = await getBlock(swapIssuer, "439F5CB566E957576C2473B7AF6F3D7D17FBF5022685EB70ED825EAC3B84A56A");
    swapAssetCrawler = new AssetCrawler(bananode, swapIssuer, swapMintBlock);
    await swapAssetCrawler.crawl();
  });

  it("confirms change#mint, send#asset, receive#asset", async () => {
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
    let mintBlockHash = "6F7ED78C5A40145EDCA76B63B1F525DC38A6A4597D59274FBEEED32619C8AF43";
    let mintBlock = await getBlock(issuer, mintBlockHash);
    let assetCrawler = new AssetCrawler(bananode, issuer, mintBlock);
    await assetCrawler.crawl();

    expect(assetCrawler.frontier.owner).to.not.equal("ban_1oozinhbrw7nrjfmtq1roybi8t7q7jywwne4pjto7oy78injdmn4n3a5w5br");
    expect(assetCrawler.frontier.owner).to.equal("ban_1twos81eoq9s6d1asht5wwz53m9kw7hkuajad1m4u5otgcsb4qstymquhahf");
  });

  it("traces chain of sends", async () => {
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

  it("ignores send#asset before receive#asset and after previously confirmed send#asset", async () => {
    // send#mint
    let mintBlockHash = "68EB50EF45651590ECC6136D20BBC8D68ECF0C352FC50DBFEC00C3DB3F5F934D";
    let mintBlock = await getBlock(issuer, mintBlockHash);
    let assetCrawler = new AssetCrawler(bananode, issuer, mintBlock);
    await assetCrawler.crawl();

    const assetChain: IAssetBlock[] = assetCrawler.assetChain;

    // ignore send#asset block before receive#asset
    for (let i = 0; i < assetChain.length; i++) {
      const assetBlock = assetChain[i];
      const invalidSendHashes = [
        // before receive#asset
        "A21E26AC888B642F84FAF3728A6D32B027502CE9F1F86F720B91A71D49BFE52C", 
        "05CF4BEA4075DFBE690E9EC0DF581CC237D9C14AF7CEECDE9E53F1426AD0F572",
        "1D065B49CC53BB693438F55C068E74BBF36DBE6C409C82EB537EFEF257EF6104",
        // send#asset after previously confirmed send#asset
        "62DCF26825FA44C394D1C468BCB6B69E779C9E17899DB04B4489C33FB58057EF"
      ]
      expect(invalidSendHashes).to.not.include(assetBlock.nanoBlock.hash);
    }

    // previously confirmed send#asset 
    expect(assetChain[2].type).to.equal("send#asset");
    expect(assetChain[2].owner).to.equal("ban_3testz6spgm48ax8kcwah6swo59sroqfn94fqsgq368z7ki44ccg8hhrx3x8");
    expect(assetChain[2].nanoBlock.hash).to.equal("31C4279ACE505BFACE38BBE4883B1D928C7742BE0C042FF92C8D69C6C8D4B1E1");
  });

  it("confirms completed valid atomic swap", async () => {
    let swapIssuer: TAccount = "ban_1swapxh34bjstbc8c5tonbncw5nrc6sgk7h71bxtetty3huiqcj6mja9rxjt";
    let mintBlockHash: TBlockHash = "01C876EE1CB115E166BF96FB1218EE0107CF07B6F9FD62ED02A40062360DF20A";
    let mintBlock = await getBlock(swapIssuer, mintBlockHash);
    let assetCrawler = new AssetCrawler(bananode, swapIssuer, mintBlock);
    await assetCrawler.crawl();

    expect(assetCrawler.frontier.nanoBlock.hash).to.equal("E8285EBCF17C5FD0DFDCE086253A72D4795032FB5E23F8D13880954D8BB8AE56");
    expect(assetCrawler.frontier.owner).to.equal("ban_1buyayd6csb1rwprgcks9sif66hthrbu9jah5ehspmsxghi63ter8f66cy1p");    
  });

  it("ignores invalid send#atomic_swap where encoded receive height is less than 2", async () => {
    expect(swapAssetCrawler.assetChain.length).to.equal(3);
  });
  
  it("ignores invalid send#atomic_swap where exact raw amount sent isn't exactly 1 raw");

  it("cancels atomic swap if paying account balance is less than min raw in block at: receive height - 1", async () => {
    expect(swapAssetCrawler.frontier.nanoBlock.hash).to.equal("F8BD752EDB490FC4B505ED878981240A79DB5C0490F7242388EF5E183E17EF29");
    expect(swapAssetCrawler.frontier.owner).to.equal("ban_1swapxh34bjstbc8c5tonbncw5nrc6sgk7h71bxtetty3huiqcj6mja9rxjt");
    expect(swapAssetCrawler.frontier.state).to.equal("owned");
    expect(swapAssetCrawler.frontier.type).to.equal("send#returned_to_sender");
  });

  // Todo: check if there's other variables that can change the block hash to break the atomic swap
  it("cancels atomic swap if receive#atomic_swap block has a different representative than previous block", async () => {
    let failSwapIssuer: TAccount = "ban_1swapxh34bjstbc8c5tonbncw5nrc6sgk7h71bxtetty3huiqcj6mja9rxjt";
    let failSwapMintBlock: INanoBlock = await getBlock(failSwapIssuer, "09ABEBF530CD96A30FA4F58B458AB7378DF6432CFC39040F6224195A006D65BA");
    let failSwapAssetCrawler = new AssetCrawler(bananode, failSwapIssuer, failSwapMintBlock);
    await failSwapAssetCrawler.crawl();

    // The receive block that changes representative and is expected to be invalid is:
    // CCBBB68F1C216C45F76C175BB2116F97080512C84D0A4830E0186DADFEF56921
    expect(failSwapAssetCrawler.frontier.nanoBlock.hash).to.equal("2EEFFD2621E2260255F200131B3CAF3D25271076DB5E8AE856DCE8BBB2DC1875");
    expect(failSwapAssetCrawler.frontier.owner).to.equal("ban_1swapxh34bjstbc8c5tonbncw5nrc6sgk7h71bxtetty3huiqcj6mja9rxjt");
    expect(failSwapAssetCrawler.frontier.state).to.equal("owned");
    expect(failSwapAssetCrawler.frontier.type).to.equal("send#returned_to_sender");
  });

  it("cancels atomic swap if a block other than the relevant receive#atomic_swap is confirmed at receive_height", async () => {
    let issuer: TAccount = "ban_3cantszxkej3kzcjjpxcu35jcn6ck884uu3q8ypd3xc1e1y61tt6jj7p99yd";
    let cantMintBlock1 = await getBlock(issuer, "050D2C75CE68241CF5E3CD180411A73A75A1781D5B2D5BAA26059A06811689A7");
    let cantAssetCrawler1 = new AssetCrawler(bananode, issuer, cantMintBlock1);
    await cantAssetCrawler1.crawl();

    expect(cantAssetCrawler1.frontier.owner).to.equal(issuer);
    expect(cantAssetCrawler1.frontier.state).to.equal("owned");
    expect(cantAssetCrawler1.frontier.type).to.equal("send#returned_to_sender");
    expect(cantAssetCrawler1.frontier.locked).to.equal(false);
  });

  it("cancels atomic swap if a block other than send#payment follows receive#atomic_swap", async () => {
    let issuer: TAccount = "ban_3cantszxkej3kzcjjpxcu35jcn6ck884uu3q8ypd3xc1e1y61tt6jj7p99yd";
    let cantMintBlock2 = await getBlock(issuer, "AE29A6AE92A3F78A49D6F1A82C014276FE95140963FCED2410A640A5173A1FC8");
    let cantAssetCrawler2 = new AssetCrawler(bananode, issuer, cantMintBlock2);
    await cantAssetCrawler2.crawl();

    expect(cantAssetCrawler2.frontier.owner).to.equal(issuer);
    expect(cantAssetCrawler2.frontier.state).to.equal("owned");
    expect(cantAssetCrawler2.frontier.type).to.equal("send#returned_to_sender");
    expect(cantAssetCrawler2.frontier.locked).to.equal(false);
  });

  it("cancels atomic swap if send#payment sends too little raw to the right account", async () => {
    let issuer: TAccount = "ban_3cantszxkej3kzcjjpxcu35jcn6ck884uu3q8ypd3xc1e1y61tt6jj7p99yd";
    let cantMintBlock3 = await getBlock(issuer, "B0BB1D5000D4A9E51993968C25A27804FC5551CFB18656B9FD7444D70C496A11");
    let cantAssetCrawler3 = new AssetCrawler(bananode, issuer, cantMintBlock3);
    await cantAssetCrawler3.crawl();

    expect(cantAssetCrawler3.frontier.owner).to.equal(issuer);
    expect(cantAssetCrawler3.frontier.state).to.equal("owned");
    expect(cantAssetCrawler3.frontier.type).to.equal("send#returned_to_sender");
    expect(cantAssetCrawler3.frontier.locked).to.equal(false);
  });

  it("cancels atomic swap if send#payment sends enough raw to the wrong account", async () => {
    let issuer: TAccount = "ban_3cantszxkej3kzcjjpxcu35jcn6ck884uu3q8ypd3xc1e1y61tt6jj7p99yd";
    let cantMintBlock4 = await getBlock(issuer, "32A3470B9217D796E16D2CE2445A5FC84F023695B099D2AE6B4B3133FF313CA6");
    let cantAssetCrawler4 = new AssetCrawler(bananode, issuer, cantMintBlock4);
    await cantAssetCrawler4.crawl();

    expect(cantAssetCrawler4.frontier.owner).to.equal(issuer);
    expect(cantAssetCrawler4.frontier.state).to.equal("owned");
    expect(cantAssetCrawler4.frontier.type).to.equal("send#returned_to_sender");
    expect(cantAssetCrawler4.frontier.locked).to.equal(false);
  });

  it("doesn't transfer ownership while send#atomic_swap and receive#atomic swap is confirmed but send#payment or #abort_payment is still unconfirmed");
});
