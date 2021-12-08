import { IAtomicSwapConditions } from "../interfaces/atomic-swap-conditions";

import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";

import { AssetCrawler } from "../asset-crawler";
import { parseAtomicSwapRepresentative } from "../block-parsers/atomic-swap";
import { findBlockAtHeight } from "../lib/find-block-at-height";
import { findBlockAtHeightAndPreviousBlock } from "../lib/find-block-at-height-and-previous-block";
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";

export async function pendingAddNextMetaBlock(assetCrawler: AssetCrawler): Promise<boolean> {
  const paymentAccount = assetCrawler.frontier.account;
  const paymentHeight = BigInt(assetCrawler.frontier.nanoBlock.height) + BigInt(1);
  const [previousBlock, nextBlock]: [INanoBlock, INanoBlock] = await findBlockAtHeightAndPreviousBlock(paymentAccount, paymentHeight);
  const sendAtomicSwap = assetCrawler.assetChain[assetCrawler.assetChain.length - 2];

  // guards
  if (typeof nextBlock === 'undefined') {
    return false;
  }
  if (sendAtomicSwap.state !== 'send_atomic_swap') {
    throw Error(`UnexpectedMetaChain: Expected states of the chain to be send_atomic_swap -> pending_atomic_swap -> ... Got: ${sendAtomicSwap.state} -> ${assetCrawler.frontier.state} -> ...`);
  }
  // NB: Trace length from findBlockAtHeight might be significantly larger than 1.
  assetCrawler.traceLength += BigInt("1");

  const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(sendAtomicSwap.nanoBlock.representative);
  const payedEnough = BigInt(nextBlock.amount) >= atomicSwapConditions.minRaw;
  const payedCorrectAccount = nextBlock.account === sendAtomicSwap.account;
  const representativeUnchanged = nextBlock.representative === previousBlock.representative;

  if (nextBlock.subtype === 'send' && payedCorrectAccount && payedEnough && representativeUnchanged) {
    assetCrawler.assetChain.push({
      state: 'ownership',
      type: 'send#payment',
      account: assetCrawler.frontier.account,
      owner: assetCrawler.frontier.account,
      locked: false,
      nanoBlock: nextBlock,
      traceLength: assetCrawler.traceLength
    });
  } else {
    // Atomic swap conditions were not met.
    // Continue chain from send#atomic_swap again with state 'ownership' instead of state 'send_atomic_swap'.
    assetCrawler.assetChain.push({
      state: 'cancel_atomic_swap',
      type: `${nextBlock.subtype}#cancel_atomic_swap`,
      account: assetCrawler.frontier.account,
      owner: sendAtomicSwap.account,
      locked: false,
      nanoBlock: nextBlock,
      traceLength: assetCrawler.traceLength
    });
    assetCrawler.assetChain.push({
      state: 'ownership',
      type: 'send#atomic_swap',
      account: sendAtomicSwap.account,
      owner: sendAtomicSwap.account,
      locked: false,
      nanoBlock: sendAtomicSwap.nanoBlock,
      traceLength: assetCrawler.traceLength
    });
  }

  return true;
}
