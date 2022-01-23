import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";

// Returns blocks from previous and forward if b
export async function allBlocksFromPrevious(account: string, hash: string, expectedHeight: bigint = undefined, count: number = undefined): Promise<(INanoBlock[])> {
  const previous = ;
  const nanoForwardIterable = new NanoAccountForwardCrawler(this.nanoNode, account, previous, undefined, undefined, count + 1);
  await nanoForwardIterable.initialize();

  const blocks: INanoBlock[] = [];

  for await (const block of nanoForwardIterable) {
    blocks.push(block);
  }

  return blocks;
}
