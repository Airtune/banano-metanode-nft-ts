import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fetch from 'node-fetch';

import { NanoNode } from 'nano-account-crawler/dist/nano-node';
import { NanoAccountForwardCrawler }  from 'nano-account-crawler/dist/nano-account-forward-crawler';
import { MetaTemplateBlockFinder } from '../src/meta-template-block-finder';
import { bananoIpfs } from '../src/banano-ipfs';
import { MetaTemplate } from '../src/meta-template';

chai.use(chaiAsPromised);
const expect = chai.expect;

const bananode = new NanoNode('https://kaliumapi.appditto.com/api', fetch);

describe('MetaTemplateBlockFinder', function() {
  this.timeout(20000);

  it('rejects QmTRg9xhnMJCnHYdAX14gTXan8JsLYMrxjpVzL6hLLDQFv', async () => {
    // Bananochita: Template/Ledger previous block mismatch
    const rawTemplate = '{"command":"nft_template","version":"0.0.1","title":"Monkey Bananochita Volcana","issuer":"ban_1nftdfyadn1ynf9bz3n8rmdejnga6b7dhdeociscsmidtuy6r4s6jzf6nejq","max_supply":"1","art_data_ipfs_cid":"QmXpzcQUmDGWTeu13FwFfscBC9SDwe2xAAm6KHyefX95AY","previous":"818040F818C7C6B17C85E80CAA4FEEE5F1CD2835174AF26B045EF70D22DEA5B0"}';
    const ipfsCid = 'QmTRg9xhnMJCnHYdAX14gTXan8JsLYMrxjpVzL6hLLDQFv';

    const metaTemplate = new MetaTemplate(rawTemplate, ipfsCid);
    await metaTemplate.initializeAndValidate();
    const issuer = metaTemplate.getIssuer();
    const previous = metaTemplate.getPrevious();

    const banCrawler = new NanoAccountForwardCrawler(bananode, issuer, previous, '1');
    await banCrawler.initialize();
    const metaTemplateBlockFinder = new MetaTemplateBlockFinder(bananoIpfs, metaTemplate, banCrawler);

    const firstAssetSendBlocksPromise = metaTemplateBlockFinder.traceAssetFirstSendBlocks();
    return expect(firstAssetSendBlocksPromise).to.be.rejected;
  });
});
