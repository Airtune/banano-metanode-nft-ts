import { NanoIpfs } from 'nano-ipfs';
import { MetaTemplate } from './meta-template'
import { NanoAccountIterableInterface } from './interfaces/nano-account-iterable-interface';
const blockHashPattern: RegExp = new RegExp('^[0-9A-Za-z]{64}$');

export class MetaTemplateCrawler {
  private nanoIpfs: NanoIpfs;
  private metaTemplate: MetaTemplate;
  private accountIterable: NanoAccountIterableInterface;
  private ipfsCid: string;

  constructor(nanoIpfs: NanoIpfs, metaTemplate: MetaTemplate, accountIterable: NanoAccountIterableInterface) {
    this.nanoIpfs = nanoIpfs;
    this.metaTemplate = metaTemplate;
    this.accountIterable = accountIterable;

    this.metaTemplate.validate();
    this.ipfsCid = this.metaTemplate.getIpfsCid();
  }

  async crawl(): Promise<any> {
    const assetBlocks = []
    const templateBlock = this.accountIterable.firstBlock();
    const templateRepresentative: string = this.nanoIpfs.hexToIpfsCidV0(templateBlock['hash']);
    const ipfsCidRepresentative: string = this.nanoIpfs.ifpsCidV0ToAccount(this.ipfsCid);
    this.validateTemplateBlock(templateBlock, ipfsCidRepresentative);

    for await (let block of this.accountIterable) {
      if (block['representative'] === templateRepresentative) {
        assetBlocks.push(block);
        if (BigInt(assetBlocks.length) >= this.metaTemplate.getMaxSupply()) {
          break;
        }
      }
    }

    return assetBlocks;
  }

  private validateTemplateBlock(templateBlock: any, ipfsCidRepresentative: string) {
    const representative = templateBlock["representative"];
  
    if (ipfsCidRepresentative !== representative) {
      throw Error(`RepresentativeMismatch: Unexpected representative for templateBlock. Expected ${ipfsCidRepresentative}, got: ${representative}`);
    }

    if (typeof(templateBlock['hash']) !== 'string' || !blockHashPattern.test(templateBlock['hash'])) {
      throw Error(`BlockHashMismatch: Expected block hash for templateBlock. Got: ${templateBlock['hash']}`);
    }
  };
}
