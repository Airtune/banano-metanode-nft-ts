import { NanoAccountBackwardCrawler } from "nano-account-crawler/dist/nano-account-backward-crawler";
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { bananode } from "../bananode";

export async function findBlockAtHeightAndPreviousBlock(account: string, height: bigint): Promise<([INanoBlock, INanoBlock]|undefined)> {
  const nanoBackwardIterable = new NanoAccountBackwardCrawler(bananode, account);
  await nanoBackwardIterable.initialize();

  const previousHeight = height - BigInt(1)

  const blocks = [];

  for await (const block of nanoBackwardIterable) {
    if (BigInt(block.height) === height) {
      blocks.push(block);
    } else if (BigInt(block.height) === previousHeight) {
      blocks.unshift(block)
      if (blocks.length === 2) {
        return blocks as [INanoBlock, INanoBlock];
      } else {
        return undefined;
      }
    }
  }

  return undefined;
}
