import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { IAtomicSwapConditions } from "../interfaces/atomic-swap-conditions";

import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";

import { AssetCrawler } from "../asset-crawler";
import { parseAtomicSwapRepresentative } from "../atomic-swap-representative";
import { IMetaBlock } from "../interfaces/meta-block";

export async function ownershipAddNextMetaBlock(assetCrawler: AssetCrawler): Promise<boolean> {
  // trace forward in account history from frontier block
  let frontierCrawler = new NanoAccountForwardCrawler(assetCrawler.nanoNode, assetCrawler.frontier.account, assetCrawler.frontier.nanoBlock.hash, "1");
  for await (const nanoBlock of frontierCrawler) {
    assetCrawler.traceLength += BigInt(1);

    const metaBlock: IMetaBlock = toMetaBlock(assetCrawler, nanoBlock);
    if (metaBlock == undefined) { continue; }

    assetCrawler.assetChain.push(metaBlock);
    return true;
  }

  return false;
}

function toMetaBlock(assetCrawler: AssetCrawler, block: INanoBlock): (IMetaBlock|undefined) {
  if (block.type !== 'state') { return undefined; }

  if (block.subtype === 'send') {
    if (block.representative === assetCrawler.assetRepresentative) {
      return {
        state: 'send',
        type: 'send#asset',
        account: assetCrawler.frontier.account,
        owner: block.account,
        locked: false,
        nanoBlock: block,
        traceLength: assetCrawler.traceLength
      };
    }
    
    const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(block.representative);
    const ownershipBlockHeight = BigInt(assetCrawler.frontier.nanoBlock.height);
    if (atomicSwapConditions && atomicSwapConditions.assetHeight === ownershipBlockHeight) {
      return {
        state: 'send_atomic_swap',
        type: 'send#atomic_swap',
        account: assetCrawler.frontier.account,
        owner: assetCrawler.frontier.account,
        locked: true,
        nanoBlock: block,
        traceLength: assetCrawler.traceLength
      };
    }
  }

  return undefined;
}
