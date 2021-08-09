import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { MetaTemplate } from "../src/meta-template";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('MetaTemplate', function() {
  it('validates a correct template without throwing', async () => {
    // Bananochita: Template is in correct format with correct cid
    const rawTemplate = '{"command":"nft_template","version":"0.0.1","title":"Monkey Bananochita Volcana","issuer":"ban_1nftdfyadn1ynf9bz3n8rmdejnga6b7dhdeociscsmidtuy6r4s6jzf6nejq","max_supply":"1","art_data_ipfs_cid":"QmXpzcQUmDGWTeu13FwFfscBC9SDwe2xAAm6KHyefX95AY","previous":"818040F818C7C6B17C85E80CAA4FEEE5F1CD2835174AF26B045EF70D22DEA5B0"}';
    const ipfsCid = 'QmTRg9xhnMJCnHYdAX14gTXan8JsLYMrxjpVzL6hLLDQFv';

    const metaTemplate = new MetaTemplate(rawTemplate, ipfsCid);
    const validationPromise = metaTemplate.initializeAndValidate();
    return expect(validationPromise).to.be.fulfilled;
  });
});
