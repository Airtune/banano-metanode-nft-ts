import { AssetCrawler } from "../asset-crawler";
import { IAtomicSwapConditions } from "../interfaces/atomic-swap-conditions";
import { parseAtomicSwapRepresentative } from "../atomic-swap-representative";
import { findBlockAtHeight } from "../lib/find-block-at-height";

export async function sendAtomicSwapAddNextMetaBlock(assetCrawler: AssetCrawler): Promise<boolean> {
  const sendAtomicSwap = assetCrawler.frontier;
  const sendAtomicSwapHash = sendAtomicSwap.nanoBlock.hash;
  const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(sendAtomicSwap.nanoBlock.representative);
  // guard
  if (typeof atomicSwapConditions === 'undefined') {
    throw Error(`AtomicSwapError: Unable to parse conditions for representative: ${sendAtomicSwap.nanoBlock.representative}`);
  }
  
  const sender = sendAtomicSwap.account;
  const recipient = sendAtomicSwap.nanoBlock.account;
  const receiveBlock = await findBlockAtHeight(recipient, atomicSwapConditions.receiveHeight);
  // guard
  if (typeof receiveBlock === 'undefined') { return false; }

  assetCrawler.nanoBlockTraceLength += BigInt(1);

  if (receiveBlock.subtype === 'receive' && receiveBlock.link === sendAtomicSwapHash && BigInt(receiveBlock.height) === atomicSwapConditions.receiveHeight) {
    assetCrawler.assetChain.push({
      state: 'pending_atomic_swap',
      type: 'receive#atomic_swap',
      account: recipient,
      owner: sender,
      locked: true,
      nanoBlock: receiveBlock,
      nanoBlockTraceLength: assetCrawler.nanoBlockTraceLength
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
      nanoBlockTraceLength: assetCrawler.nanoBlockTraceLength
    });
    assetCrawler.assetChain.push({
      state: 'ownership',
      type: 'send#atomic_swap',
      account: sendAtomicSwap.account,
      owner: sendAtomicSwap.account,
      locked: false,
      nanoBlock: sendAtomicSwap.nanoBlock,
      nanoBlockTraceLength: assetCrawler.nanoBlockTraceLength
    });
  }

  return true;
}
