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
import { TAccount } from "../../types/banano";

// State for when the the block's account own the asset.
export async function ownedCrawl(assetCrawler: AssetCrawler): Promise<boolean> {
  // trace forward in account history from frontier block
  let frontierCrawler = new NanoAccountForwardCrawler(assetCrawler.nanoNode, assetCrawler.frontier.account, assetCrawler.frontier.nanoBlock.hash, "1");
  await frontierCrawler.initialize();

  for await (const nanoBlock of frontierCrawler) {
    assetCrawler.traceLength += BigInt(1);

    const assetBlock: IAssetBlock = toAssetBlock(assetCrawler, nanoBlock);
    if (assetBlock === undefined) { continue; }

    assetCrawler.assetChain.push(assetBlock);
    return true;
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

    const representative = block.representative as TAccount;
    const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(representative);
    const ownershipBlockHeight = BigInt(assetCrawler.frontier.nanoBlock.height);
    const attemptTradeWithSelf = block.account == assetCrawler.frontier.owner;
    const validReceiveHeight   = atomicSwapConditions && atomicSwapConditions.receiveHeight >= BigInt(2);
    const currentAssetHeight   = atomicSwapConditions && atomicSwapConditions.assetHeight === ownershipBlockHeight
    if (!attemptTradeWithSelf && validReceiveHeight && currentAssetHeight) {
      return {
        state: 'atomic_swap_receivable',
        type: 'send#atomic_swap',
        account: assetCrawler.frontier.account,
        owner: assetCrawler.frontier.owner,
        locked: true,
        nanoBlock: block,
        traceLength: assetCrawler.traceLength
      };
    }
  }

  return undefined;
}
