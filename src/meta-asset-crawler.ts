import { NanoAccountForwardCrawler } from 'nano-account-crawler/dist/nano-account-forward-crawler'
import { NanoAccountBackwardCrawler } from 'nano-account-crawler/dist/nano-account-backward-crawler'
import { NanoNode } from 'nano-account-crawler/dist/nano-node'
import { INanoBlock } from 'nano-account-crawler/dist/nano-interfaces';

export class MetaAssetCrawler {
  private nanoNode: NanoNode;
  private issuer: string;
  private assetFirstSendBlock: INanoBlock;
  private assetRepresentative: string;

  constructor(nanoNode: NanoNode, issuer: string, assetFirstSendBlock: INanoBlock, assetRepresentative: string) {
    this.nanoNode = nanoNode;
    this.issuer = issuer;
    this.assetFirstSendBlock = assetFirstSendBlock;
    this.assetRepresentative = assetRepresentative;
  }

  async crawl(): Promise<INanoBlock[]> {
    let headSender = this.issuer;
    let headSend = this.assetFirstSendBlock;
    let headRecipient;
    const chain = [headSend];
    
    while (true) {
      const receiveBlock = await this.findReceiveBlock(headSender, headSend.hash, headSend.link);
      if (receiveBlock === undefined) { break; }
      headRecipient = headSend.account;
      chain.push(receiveBlock);

      const sendBlock = await this.findSendBlock(headRecipient, receiveBlock.hash, this.assetRepresentative);
      if (sendBlock === undefined) { break; }
      headSend = sendBlock;
      headSender = headRecipient;
      chain.push(sendBlock);
    }

    return chain;
  }

  private async findSendBlock(account: string, receiveBlockHash: string, assetRepresentative: string): Promise<(INanoBlock|undefined)> {
    const nanoForwardIterable = new NanoAccountForwardCrawler(this.nanoNode, account, receiveBlockHash, "1");
    await nanoForwardIterable.initialize();

    for await (const block of nanoForwardIterable) {
      if (block.type === 'state' && block.subtype === 'send' && block.representative === assetRepresentative) {
        return block;
      }
    }

    return undefined;
  }

  private async findReceiveBlock(senderAccount: string, sendHash: string, receiverAccount: string): Promise<(INanoBlock|undefined)> {
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
