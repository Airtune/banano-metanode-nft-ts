import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { AssetCrawler } from "./asset-crawler";
import { IMetaBlock } from "./interfaces/meta-block";
import { parseAtomicSwapRepresentative } from "./atomic-swap-representative";
import { IAtomicSwapConditions } from "./interfaces/atomic-swap-conditions";

export function identifyMetaBlockType(assetCrawler: AssetCrawler, block: INanoBlock): (string|undefined) {
  if (block.type !== 'state') { return undefined; }

  // Identify new block based on current frontier for the asset
  const frontier: IMetaBlock = assetCrawler.frontier;
  const frontierCategory = identifyFrontierCategory(frontier);

  if (frontierCategory === 'ownership') {
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

  if (frontierCategory === 'send') {
    if (block.link === frontier.nanoBlock.hash && block.subtype === 'receive') {
      return 'receive#asset';
    }
  }

  if (frontierCategory === 'atomic_swap') {
    if (block.link === frontier.nanoBlock.hash && block.subtype === 'receive') {
      return 'receive#asset';
    }
  }

  // Ignore block if it doesn't match any meta block types.
  return undefined;
}

function identifyFrontierCategory(frontier: IMetaBlock): (string|undefined) {
  // Frontier: Received an asset.
  if (frontier.type === 'receive#asset' || frontier.type === 'change#mint' || frontier.type === 'send#payment') {
    return 'ownership'
  }

  // Frontier: Sent an asset.
  if (frontier.type === 'send#asset' || frontier.type == 'send#mint') {
    return 'send'
  }

  // Frontier: Sent an atomic swap
  if (frontier.type === 'send#atomic_swap') {
    return 'atomic_swap'
  }

  return undefined;
}
