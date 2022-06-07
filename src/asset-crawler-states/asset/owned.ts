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
import { BURN_ACCOUNTS, SEND_ALL_NFTS_REPRESENTATIVE } from "../../constants";

// src
import { AssetCrawler } from "../../asset-crawler";
import { parseAtomicSwapRepresentative } from "../../block-parsers/atomic-swap";
import { TAccount } from "../../types/banano";

// State for when the the block's account own the asset.
export async function ownedCrawl(assetCrawler: AssetCrawler): Promise<boolean> {
  // trace forward in account history from frontier block
  let frontierCrawler = new NanoAccountForwardCrawler(assetCrawler.nanoNode, assetCrawler.frontier.owner, assetCrawler.frontier.nanoBlock.hash, "1");

  try {
    await frontierCrawler.initialize();

    for await (const nanoBlock of frontierCrawler) {
      assetCrawler.traceLength += BigInt(1);

      const assetBlock: IAssetBlock = toAssetBlock(assetCrawler, nanoBlock);
      if (assetBlock === undefined) { continue; }

      assetCrawler.assetChain.push(assetBlock);
      return true;
    }
  } catch(error) {
    throw(error);
  }

  return false;
}

function toAssetBlock(assetCrawler: AssetCrawler, block: INanoBlock): (IAssetBlock|undefined) {
  if (block.type !== 'state') { return undefined; }

  if (block.subtype === 'send') {
    if (block.representative === assetCrawler.assetRepresentative || block.representative === SEND_ALL_NFTS_REPRESENTATIVE) {
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
        account: recipient,
        owner: recipient,
        locked: false,
        nanoBlock: block,
        traceLength: assetCrawler.traceLength
      };
    }

    const ownerAccount   = assetCrawler.frontier.owner;
    const payingAccount  = block.account;
    const representative = block.representative as TAccount;
    const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(representative);
    const ownershipBlockHeight = BigInt(assetCrawler.frontier.nanoBlock.height);
    const attemptTradeWithSelf = payingAccount == ownerAccount;
    const validReceiveHeight   = atomicSwapConditions && atomicSwapConditions.receiveHeight >= BigInt(2);
    const currentAssetHeight   = atomicSwapConditions && atomicSwapConditions.assetHeight === ownershipBlockHeight;
    const sends1raw            = atomicSwapConditions && BigInt(block.amount) == BigInt('1');
    if (!attemptTradeWithSelf && validReceiveHeight && currentAssetHeight && sends1raw) {
      const payingAccount = block.account;
      return {
        state: 'atomic_swap_receivable',
        type: 'send#atomic_swap',
        account: payingAccount,
        owner: ownerAccount,
        locked: true,
        nanoBlock: block,
        traceLength: assetCrawler.traceLength
      };
    }
  }

  return undefined;
}
