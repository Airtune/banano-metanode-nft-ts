// dependencies
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";

// interfaces
import { IAssetBlock } from "../../interfaces/asset-block";
import { IAtomicSwapConditions } from "../../interfaces/atomic-swap-conditions";

// types
import { TAssetState } from "../../types/asset-state";
import { TAssetBlockType } from "../../types/asset-block-type";

// constants
import { BURN_ACCOUNTS } from "../../constants";

// src
import { AssetCrawler } from "../../asset-crawler";
import { parseAtomicSwapRepresentative } from "../../block-parsers/atomic-swap";

// State for when the the block's account own the asset.
export async function burnedAddNextAssetBlock(assetCrawler: AssetCrawler): Promise<boolean> {
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
        state = "receivable";
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
        state: 'atomic_swap_receivable',
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