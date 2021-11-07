import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { IAtomicSwapConditions } from "../interfaces/atomic-swap-conditions";

import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";

import { AssetCrawler } from "../asset-crawler";
import { parseAtomicSwapRepresentative } from "../atomic-swap-representative";

export async function ownershipAddNextMetaBlock(assetCrawler: AssetCrawler): Promise<boolean> {
  // trace forward in account history from frontier block
  let frontierCrawler = new NanoAccountForwardCrawler(assetCrawler.nanoNode, assetCrawler.frontier.account, assetCrawler.frontier.nanoBlock.hash, "1");
  for await (const nanoBlock of frontierCrawler) {
    assetCrawler.nanoBlockTraceLength = assetCrawler.nanoBlockTraceLength + BigInt(1);
    const metaBlockType = nextMetaBlockType(assetCrawler, nanoBlock);
    if (metaBlockType == undefined) { continue; }

    if (metaBlockType === 'send#asset') {
      assetCrawler.assetChain.push({
        state: 'send',
        type: metaBlockType,
        account: assetCrawler.frontier.account,
        owner: nanoBlock.account,
        locked: false,
        nanoBlock: nanoBlock,
        nanoBlockTraceLength: assetCrawler.nanoBlockTraceLength
      });
      return true;
    }

    if (metaBlockType === 'send#atomic_swap') {
      assetCrawler.assetChain.push({
        state: 'send_atomic_swap',
        type: metaBlockType,
        account: assetCrawler.frontier.account,
        owner: assetCrawler.frontier.account,
        locked: true,
        nanoBlock: nanoBlock,
        nanoBlockTraceLength: assetCrawler.nanoBlockTraceLength
      });
      return true;
    }
  }

  return false;
}

function nextMetaBlockType(assetCrawler: AssetCrawler, block: INanoBlock): (string|undefined) {
  if (block.type !== 'state') { return undefined; }

  if (block.subtype === 'send') {
    if (block.representative === assetCrawler.assetRepresentative) {
      return 'send#asset';
    }
    
    // At least 1 supply block and 1 mint block required before you can swap
    if (assetCrawler.assetChain.length > 2) {
      const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(block.representative);
      const ownershipBlockHeight = BigInt(assetCrawler.frontier.nanoBlock.height);
      if (atomicSwapConditions && atomicSwapConditions.assetHeight === ownershipBlockHeight) {
        return 'send#atomic_swap';
      }
    }
  }
}
