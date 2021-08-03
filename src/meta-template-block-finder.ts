import { NanoIpfs } from 'nano-ipfs';
import { MetaTemplate } from './meta-template'
import { INanoBlock, INanoAccountForwardIterable } from './interfaces/nano-interfaces';
const blockHashPattern: RegExp = new RegExp('^[0-9A-Za-z]{64}$');

export class MetaTemplateBlockFinder {
  private nanoIpfs: NanoIpfs;
  private metaTemplate: MetaTemplate;
  private accountForwardIterable: INanoAccountForwardIterable;
  private ipfsCid: string;

  constructor(nanoIpfs: NanoIpfs, metaTemplate: MetaTemplate, accountForwardIterable: INanoAccountForwardIterable) {
    this.nanoIpfs = nanoIpfs;
    this.metaTemplate = metaTemplate;
    this.accountForwardIterable = accountForwardIterable;

    this.metaTemplate.validate();
  }

  async traceAssetFirstSendBlocks(): Promise<INanoBlock[]> {
    const assetFirstSendBlocks = []
    const templateBlock: INanoBlock = this.accountForwardIterable.firstBlock();
    const templateRepresentative: string = this.nanoIpfs.hexToIpfsCidV0(templateBlock.hash);
    this.validateTemplateBlock(templateBlock);

    for await (const block of this.accountForwardIterable) {
      if (block.representative === templateRepresentative) {
        assetFirstSendBlocks.push(block);
        if (BigInt(assetFirstSendBlocks.length) >= this.metaTemplate.getMaxSupply()) {
          break;
        }
      }
    }

    return assetFirstSendBlocks;
  }

  private validateTemplateBlock(templateBlock: INanoBlock) {
    const ipfsCid = this.metaTemplate.getIpfsCid();
    const ipfsCidRepresentative: string = this.nanoIpfs.ifpsCidV0ToAccount(ipfsCid);
    const representative = templateBlock["representative"];
  
    if (ipfsCidRepresentative !== representative) {
      throw Error(`InvalidTemplateBlock: Unexpected representative for templateBlock. Expected ${ipfsCidRepresentative}, got: ${representative}`);
    }

    if (typeof(templateBlock['hash']) !== 'string' || !blockHashPattern.test(templateBlock['hash'])) {
      throw Error(`InvalidTemplateBlock: Expected block hash for templateBlock. Got: ${templateBlock['hash']}`);
    }

    const templatePrevious = this.metaTemplate.getPrevious();
    if (templatePrevious !== templateBlock.previous) {
      throw Error(`InvalidTemplateBlock: Expected templateBlock.previous to match templatePrevious. Got templateBlock.previous: ${templateBlock.previous}. Got templatePrevious: ${templatePrevious}.`)
    }
  }
}
