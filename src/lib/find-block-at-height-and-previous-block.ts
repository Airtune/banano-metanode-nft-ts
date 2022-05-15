import { NanoAccountBackwardCrawler } from "nano-account-crawler/dist/nano-account-backward-crawler";
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { bananode } from "../bananode";

export async function findBlockAtHeightAndPreviousBlock(account: string, height: bigint): Promise<([INanoBlock, INanoBlock]|undefined)> {
  const nanoBackwardIterable = new NanoAccountBackwardCrawler(bananode, account);
  await nanoBackwardIterable.initialize();

  const previousHeight = height - BigInt(1)

  let previousBlock: INanoBlock = undefined;
  let block: INanoBlock         = undefined;

  for await (const _block of nanoBackwardIterable) {
    let _height = BigInt(_block.height);
    if (_height === height) {
      block = _block;
    } else if (_height === previousHeight) {
      previousBlock = _block;
    } else if (_height < previousHeight) {
      break;
    }
  }

  return [previousBlock, block];
}
