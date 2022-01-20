import { NanoAccountBackwardCrawler } from "nano-account-crawler/dist/nano-account-backward-crawler";
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";

export async function findBlockAtHeight(account: string, height: bigint): Promise<(INanoBlock|undefined)> {
  const nanoBackwardIterable = new NanoAccountBackwardCrawler(this.nanoNode, account);
  await nanoBackwardIterable.initialize();

  // TODO: Compare the `offset` parameter in the `account_history` RPC to the crawler
  for await (const block of nanoBackwardIterable) {
    if (BigInt(block.height) === height) {
      return block;
    }
  }

  return undefined;
}
