import { NanoAccountBackwardCrawler } from "nano-account-crawler/dist/nano-account-backward-crawler";
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { bananode } from "../bananode";


export async function findReceiveBlock(senderAccount: string, sendHash: string, receiverAccount: string): Promise<(INanoBlock|undefined)> {
  const nanoBackwardIterable = new NanoAccountBackwardCrawler(bananode, receiverAccount, undefined, [senderAccount]);
  await nanoBackwardIterable.initialize();

  for await (const block of nanoBackwardIterable) {
    if (block.type === 'state' && block.subtype === 'receive' && block.link === sendHash) {
      return block;
    }
  }

  return undefined;
}
