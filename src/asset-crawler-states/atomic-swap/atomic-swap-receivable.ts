import { AssetCrawler } from "../asset-crawler";
import { IAtomicSwapConditions } from "../interfaces/atomic-swap-conditions";
import { parseAtomicSwapRepresentative } from "../block-parsers/atomic-swap";
import { findBlockAtHeightAndPreviousBlock } from "../lib/find-block-at-height-and-previous-block";

// State for when send#atomic_swap is confirmed and receive#atomic_swap is ready to be received but hasn't been confirmed yet.
export async function atomicSwapReceivableAddNextAssetBlock(assetCrawler: AssetCrawler): Promise<boolean> {
  const sendAtomicSwap = assetCrawler.frontier;
  const sendAtomicSwapHash = sendAtomicSwap.nanoBlock.hash;
  const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(sendAtomicSwap.nanoBlock.representative);
  // guard
  if (typeof atomicSwapConditions === 'undefined') {
    throw Error(`AtomicSwapError: Unable to parse conditions for representative: ${sendAtomicSwap.nanoBlock.representative}`);
  }
  
  const sender = sendAtomicSwap.account;
  const recipient = sendAtomicSwap.nanoBlock.account;
  const blocks = await findBlockAtHeightAndPreviousBlock(recipient, atomicSwapConditions.receiveHeight);
  // guard
  if (blocks === undefined) { return false; }

  const [previousBlock, receiveBlock] = blocks;
  // NB: Trace length from findBlockAtHeight might be significantly larger than 1.
  assetCrawler.traceLength += BigInt(1);

  const isReceive = receiveBlock.subtype === 'receive'
  const receivesAtomicSwap = receiveBlock.link === sendAtomicSwapHash;
  const hasCorrectHeight = BigInt(receiveBlock.height) === atomicSwapConditions.receiveHeight;
  const representativeUnchanged = receiveBlock.representative == previousBlock.representative;

  if (isReceive && receivesAtomicSwap && hasCorrectHeight && representativeUnchanged) {
    assetCrawler.assetChain.push({
      state: 'pending_payment',
      type: 'receive#atomic_swap',
      account: recipient,
      owner: sender,
      locked: true,
      nanoBlock: receiveBlock,
      traceLength: assetCrawler.traceLength
    });
  } else {
    // Atomic swap conditions were not met. Start chain from send#atomic_swap with new state.
    assetCrawler.assetChain.push({
      state: 'cancel_atomic_swap',
      type: 'receive#atomic_swap',
      account: recipient,
      owner: sender,
      locked: false,
      nanoBlock: receiveBlock,
      traceLength: assetCrawler.traceLength
    });
    assetCrawler.assetChain.push({
      state: 'owned',
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
