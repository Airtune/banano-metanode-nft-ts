import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { AssetCrawler } from "./asset-crawler";
import { IMetaBlock } from "./interfaces/meta-block";
import { parseAtomicSwapRepresentative } from "./atomic-swap-representative";
import { IAtomicSwapConditions } from "./interfaces/atomic-swap-conditions";

// Identify type for block added after current frontier in assetCrawler.
export function nextMetaBlockType(assetCrawler: AssetCrawler, block: INanoBlock): (string|undefined) {
  if (block.type !== 'state') { return undefined; }

  const frontier: IMetaBlock = assetCrawler.frontier;

  if (frontier.state === 'ownership') {
    if (block.subtype === 'send') {
      if (block.representative === assetCrawler.assetRepresentative) {
        return 'send#asset';
      }
      
      // At least 1 supply block and 1 mint block required before you can swap
      if (assetCrawler.assetChain.length > 2) {
        const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(block.representative);
        if (atomicSwapConditions && atomicSwapConditions.assetHeight == BigInt(frontier.nanoBlock.height)) {
          return 'send#atomic_swap';
        }
      }
    }
  }

  if (frontier.state === 'send') {
    if (block.link === frontier.nanoBlock.hash && block.subtype === 'receive') {
      return 'receive#asset';
    }
  }

  if (frontier.state === 'send_atomic_swap') {
    if (block.link === frontier.nanoBlock.hash && block.subtype === 'receive') {
      const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(frontier.nanoBlock.representative);
      if (atomicSwapConditions && atomicSwapConditions.receiveHeight == BigInt(block.height)) {
        return 'receive#atomic_swap';
      } else {
        return 'receive#cancel_atomic_swap';
      }
    }
  }

  // Ignore block if it doesn't match any meta block types.
  return undefined;
}
