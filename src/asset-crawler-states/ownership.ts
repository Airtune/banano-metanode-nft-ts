import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { IAtomicSwapConditions } from "../interfaces/atomic-swap-conditions";

import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";

import { AssetCrawler } from "../asset-crawler";
import { parseAtomicSwapRepresentative } from "../block-parsers/atomic-swap";
import { IAssetBlock, TAssetState, TAssetBlockType } from "../interfaces/asset-block";
import { BURN_ACCOUNTS } from "../constants";

export async function ownershipAddNextAssetBlock(assetCrawler: AssetCrawler): Promise<boolean> {
  // trace forward in account history from frontier block
  let frontierCrawler = new NanoAccountForwardCrawler(assetCrawler.nanoNode, assetCrawler.frontier.account, assetCrawler.frontier.nanoBlock.hash, "1");
  for await (const nanoBlock of frontierCrawler) {
    assetCrawler.traceLength += BigInt(1);

    const assetBlock: IAssetBlock = toAssetBlock(assetCrawler, nanoBlock);
    if (assetBlock === undefined) { continue; }

    assetCrawler.assetChain.push(assetBlock);

    if (assetBlock.state === "burned") {
      return false;
    } else {
      return true;
    }
  }

  return false;
}

function toAssetBlock(assetCrawler: AssetCrawler, block: INanoBlock): (IAssetBlock|undefined) {
  if (block.type !== 'state') { return undefined; }

  if (block.subtype === 'send') {
    if (block.representative === assetCrawler.assetRepresentative) {
      const recipient = block.account;
      let state: TAssetState;
      let type: TAssetBlockType;
      if (BURN_ACCOUNTS.includes(recipient)) {
        state = "burned";
        type = "send#burn";
      } else {
        state = "send";
        type = "send#asset";
      }
      return {
        state: state,
        type: type,
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
