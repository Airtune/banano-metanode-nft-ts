import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { IAtomicSwapConditions } from "../../interfaces/atomic-swap-conditions";
import { TAssetBlockType } from "../../types/asset-block-type";

import { AssetCrawler } from "../../asset-crawler";
import { parseAtomicSwapRepresentative } from "../../block-parsers/atomic-swap";
import { findBlockAtHeightAndPreviousBlock } from "../../lib/find-block-at-height-and-previous-block";
import { TAccount } from "../../types/banano";
import { IAssetBlock } from "../../interfaces/asset-block";

function validPayment(previousBlock: INanoBlock, nextBlock: INanoBlock, sendAtomicSwap: IAssetBlock, atomicSwapConditions: IAtomicSwapConditions) {
  if (nextBlock.subtype !== 'send') {
    return false;
  }

  const payedEnough = BigInt(nextBlock.amount) >= atomicSwapConditions.minRaw;
  const payedCorrectAccount = nextBlock.account === sendAtomicSwap.owner;
  const representativeUnchanged = nextBlock.representative === previousBlock.representative;

  return payedEnough && payedCorrectAccount && representativeUnchanged;
}

// State for when receive#atomic_swap is confirmed but send#payment hasn't been sent yet.
export async function pendingPaymentCrawl(assetCrawler: AssetCrawler): Promise<boolean> {
  const payingAccount = assetCrawler.frontier.account;
  const paymentHeight = BigInt(assetCrawler.frontier.nanoBlock.height) + BigInt(1);
  const [previousBlock, nextBlock]: [INanoBlock, INanoBlock] = await findBlockAtHeightAndPreviousBlock(payingAccount, paymentHeight);
  const sendAtomicSwap: IAssetBlock = assetCrawler.findSendAtomicSwapBlock();
  // guards
  if (nextBlock === undefined || sendAtomicSwap === undefined) {
    return false;
  }
  if (sendAtomicSwap.state !== 'atomic_swap_receivable') {
    throw Error(`UnexpectedMetaChain: Expected states of the chain to be pending_atomic_swap -> pending_payment -> ... Got: ${sendAtomicSwap.state} -> ${assetCrawler.frontier.state} -> ...`);
  }
  // NB: Trace length from findBlockAtHeight might be significantly larger than 1.
  assetCrawler.traceLength += BigInt("1");

  const atomicSwapConditions: IAtomicSwapConditions = assetCrawler.currentAtomicSwapConditions();

  const originalOwner = sendAtomicSwap.owner;
  
  if (validPayment(previousBlock, nextBlock, sendAtomicSwap, atomicSwapConditions)) {
    assetCrawler.assetChain.push({
      state: 'owned',
      type: 'send#payment',
      account: payingAccount,
      owner: payingAccount,
      locked: false,
      nanoBlock: nextBlock,
      traceLength: assetCrawler.traceLength
    });
  } else {
    // Atomic swap conditions were not met.
    // Continue chain from send#atomic_swap again with state 'owned' instead of state 'pending_atomic_swap'.
    let type: TAssetBlockType;
    switch (nextBlock.subtype) {
      case "send":
      case "receive":
      case "change":
        type = `${nextBlock.subtype}#abort_payment`;
        break;
    
      default:
        throw Error(`UnexpectedBlockSubtype: Pending atomic swap got unexpected block subtype: ${nextBlock.subtype} with block hash: ${nextBlock.hash}`);
    }
    assetCrawler.assetChain.push({
      state: "(return_to_nft_seller)",
      type: type,
      account: originalOwner,
      owner: originalOwner,
      locked: false,
      nanoBlock: nextBlock,
      traceLength: assetCrawler.traceLength
    });
    assetCrawler.assetChain.push({
      state: "owned",
      type: "send#returned_to_sender", // essentially ignored because state on the line above is owned
      account: originalOwner,
      owner: originalOwner,
      locked: false,
      nanoBlock: sendAtomicSwap.nanoBlock,
      traceLength: assetCrawler.traceLength
    });
  }

  return true;
}
