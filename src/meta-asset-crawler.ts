import { NanoNode } from './nano-node'
import { INanoBlock } from './interfaces/nano-interfaces';
import { NanoAccountBackwardCrawler } from './nano-account-backward-crawler';
import { NanoAccountForwardCrawler } from './nano-account-forward-crawler';

export class MetaAssetCrawler {
  private nanoNode: NanoNode;
  private issuer: string;
  private assetFirstSendBlockHash: string;
  private assetRepresentative: string;
  private firstReceiverAccount: string;

  constructor(nanoNode: NanoNode, issuer: string, assetFirstSendBlockHash: string, assetRepresentative: string, firstReceiverAccount: string) {
    this.nanoNode = nanoNode;
    this.issuer = issuer;
    this.assetFirstSendBlockHash = assetFirstSendBlockHash;
    this.assetRepresentative = assetRepresentative;
    this.firstReceiverAccount = firstReceiverAccount;
  }

  async crawl(): Promise<INanoBlock[]> {
    const receiveBlock = await this.findReceiveBlock(this.issuer, this.assetFirstSendBlockHash, this.firstReceiverAccount);
    if (receiveBlock === undefined) { return []; }

    const sendBlock = await this.findSendBlock(this.firstReceiverAccount, receiveBlock.hash, this.assetRepresentative);
    if (sendBlock === undefined) { return [receiveBlock]; }
  }

  async findSendBlock(account: string, receiveBlockHash: string, assetRepresentative: string): Promise<(INanoBlock|undefined)> {
    const nanoForwardIterable = new NanoAccountForwardCrawler(this.nanoNode, account, receiveBlockHash, "1");
    await nanoForwardIterable.initialize();

    for await (const block of nanoForwardIterable) {
      if (block.type === 'state' && block.subtype === 'send' && block.representative === assetRepresentative) {
        return block;
      }
    }

    return undefined;
  }

  async findReceiveBlock(senderAccount: string, sendHash: string, receiverAccount: string): Promise<(INanoBlock|undefined)> {
    const nanoBackwardIterable = new NanoAccountBackwardCrawler(this.nanoNode, receiverAccount, undefined, [senderAccount]);
    await nanoBackwardIterable.initialize();

    for await (const block of nanoBackwardIterable) {
      if (block.type == 'state' && block.subtype === 'receive' && block.link == sendHash) {
        return block;
      }
    }

    return undefined;
  }
}
