import { AssetCrawler } from "../../asset-crawler";
import { bananode } from "../../bananode";
import { IAtomicSwapConditions } from "../../interfaces/atomic-swap-conditions";
import { parseAtomicSwapRepresentative } from "../../block-parsers/atomic-swap";
import { findBlockAtHeightAndPreviousBlock } from "../../lib/find-block-at-height-and-previous-block";
import { findBlockAtHeight } from "../../lib/find-block-at-height";
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";
import { TAccount } from "../../types/banano";

// State for when send#atomic_swap is confirmed and receive#atomic_swap is ready to be received but hasn't been confirmed yet.
export async function pendingDelegationAddNextAssetBlock(assetCrawler: AssetCrawler): Promise<boolean> {
  const sendDelegation = assetCrawler.frontier;
  const sendDelegationHash = sendDelegation.nanoBlock.hash;
  const sendDelegationRepresentative: TAccount = sendDelegation.nanoBlock.representative as TAccount;
  const atomicSwapDelegationConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(sendDelegationRepresentative);

  // guard
  if (typeof atomicSwapDelegationConditions === 'undefined') {
    throw Error(`AtomicSwapDelegationError: Unable to parse conditions for representative: ${sendDelegation.nanoBlock.representative}`);
  }

  const sender = sendDelegation.account;
  const recipient = sendDelegation.nanoBlock.account;

  const receiveBlock: INanoBlock = await findBlockAtHeight(recipient, atomicSwapDelegationConditions.receiveHeight);
  const previousHash = receiveBlock.previous;

  const crawler = new NanoAccountForwardCrawler(bananode, recipient, previousHash, undefined, undefined, 3);

  let blockIndex = 0;
  let previousRepresentative: string;

  for await (const block of crawler) {
    if (blockIndex === 0) {
      // cache previous representative to ensure it doesn't change during delegation
      previousRepresentative = block.representative;

    } else if (blockIndex === 1) {
      // check 

    } else if (blockIndex === 2) {
      //

    } else if (blockIndex > 2) {
      break;
    }
    
    blockIndex += 1;
  }

  const blocks = await findBlockAtHeightAndPreviousBlock(recipient, atomicSwapDelegationConditions.receiveHeight);
  // guard
  if (blocks === undefined) { return false; }
  if (blocks.length !== 2) { return false; }

  //const [previousBlock, receiveBlock] = blocks;
  // NB: Trace length from findBlockAtHeight might be significantly larger than 1.
  assetCrawler.traceLength += BigInt(1);

  const isReceive = receiveBlock.subtype === 'receive'
  const receivesAtomicSwap = receiveBlock.link === sendDelegationHash;
  const hasCorrectHeight = BigInt(receiveBlock.height) === atomicSwapDelegationConditions.receiveHeight;
  const representativeUnchanged = receiveBlock.representative == blocks[0].representative;

  if (isReceive && receivesAtomicSwap && hasCorrectHeight && representativeUnchanged) {
    assetCrawler.assetChain.push({
      state: 'delegated_atomic_swap_payable',
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
      state: '(return_to_nft_seller)',
      type: 'receive#atomic_swap',
      account: recipient,
      owner: sender,
      locked: false,
      nanoBlock: receiveBlock,
      traceLength: assetCrawler.traceLength
    });
    assetCrawler.assetChain.push({
      state: 'delegated',
      type: 'send#atomic_swap',
      account: sendDelegation.account,
      owner: sendDelegation.account,
      locked: false,
      nanoBlock: sendDelegation.nanoBlock,
      traceLength: assetCrawler.traceLength
    });
  }

  return true;
}
