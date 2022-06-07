import { AssetCrawler } from "../../asset-crawler";
import { IAtomicSwapConditions } from "../../interfaces/atomic-swap-conditions";
import { parseAtomicSwapRepresentative } from "../../block-parsers/atomic-swap";
import { findBlockAtHeightAndPreviousBlock } from "../../lib/find-block-at-height-and-previous-block";
import { TAccount } from "../../types/banano";

// State for when send#atomic_swap is confirmed and receive#atomic_swap is ready to be received but hasn't been confirmed yet.
export async function atomicSwapReceivableCrawl(assetCrawler: AssetCrawler): Promise<boolean> {
  const sendAtomicSwap = assetCrawler.frontier;
  const sendAtomicSwapHash = sendAtomicSwap.nanoBlock.hash;
  const representative = sendAtomicSwap.nanoBlock.representative as TAccount;
  const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(representative);
  // guard
  if (typeof atomicSwapConditions === 'undefined') {
    throw Error(`AtomicSwapError: Unable to parse conditions for representative: ${sendAtomicSwap.nanoBlock.representative}`);
  }

  // guard check if paying account doesn't have enough raw.
  const payerAccount = sendAtomicSwap.account;
  const originalOwner = sendAtomicSwap.owner;

  // NB: Trace length from findBlockAtHeight might be significantly larger than 1.
  assetCrawler.traceLength += BigInt(1);
  const blocks = await findBlockAtHeightAndPreviousBlock(payerAccount, atomicSwapConditions.receiveHeight);
  const [previousBlock, receiveBlock] = blocks;

  if (previousBlock === undefined) { return false; }
  if (BigInt(previousBlock.balance) < atomicSwapConditions.minRaw) {
    assetCrawler.assetChain.push({
      state: "owned",
      type: "send#returned_to_sender",
      account: originalOwner,
      owner: originalOwner,
      locked: false,
      nanoBlock: sendAtomicSwap.nanoBlock,
      traceLength: assetCrawler.traceLength
    });

    return true;
  }
  
  // guard
  if (receiveBlock === undefined) { return false; }

  const isReceive = receiveBlock.subtype === 'receive'
  const receivesAtomicSwap = receiveBlock.link === sendAtomicSwapHash;
  const hasCorrectHeight = BigInt(receiveBlock.height) === atomicSwapConditions.receiveHeight;
  const representativeUnchanged = receiveBlock.representative == previousBlock.representative;

  if (isReceive && receivesAtomicSwap && hasCorrectHeight && representativeUnchanged) {
    assetCrawler.assetChain.push({
      state: "atomic_swap_payable",
      type: "receive#atomic_swap",
      account: payerAccount,
      owner: originalOwner,
      locked: true,
      nanoBlock: receiveBlock,
      traceLength: assetCrawler.traceLength
    });
  } else {
    // Atomic swap conditions were not met. Start chain from send#atomic_swap with new state.
    assetCrawler.assetChain.push({
      state: "(return_to_nft_seller)",
      type: "receive#abort_receive_atomic_swap",
      account: originalOwner,
      owner: originalOwner,
      locked: false,
      nanoBlock: receiveBlock,
      traceLength: assetCrawler.traceLength
    });
    assetCrawler.assetChain.push({
      state: 'owned',
      type: 'send#returned_to_sender',
      account: originalOwner,
      owner: originalOwner,
      locked: false,
      nanoBlock: sendAtomicSwap.nanoBlock,
      traceLength: assetCrawler.traceLength
    });
  }

  return true;
}
