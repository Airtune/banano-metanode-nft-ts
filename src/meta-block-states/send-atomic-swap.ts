import { findReceiveBlock } from "../lib/find-receive-block";
import { AssetCrawler } from "../asset-crawler";
import { IAtomicSwapConditions } from "../interfaces/atomic-swap-conditions";
import { parseAtomicSwapRepresentative } from "../atomic-swap-representative";

export async function sendAtomicSwapAddNextMetaBlock(assetCrawler: AssetCrawler): Promise<boolean> {
  const sendAtomicSwap = assetCrawler.frontier;
  const blockHash = assetCrawler.frontier.nanoBlock.hash;
  const sender = assetCrawler.frontier.account;
  const recipient = assetCrawler.frontier.nanoBlock.account;
  const receiveBlock = await findReceiveBlock(sender, blockHash, recipient);
  if (typeof receiveBlock !== 'undefined') {
    assetCrawler.nanoBlockTraceLength = assetCrawler.nanoBlockTraceLength + BigInt(1);
    const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(sendAtomicSwap.nanoBlock.representative);
    if (atomicSwapConditions && BigInt(receiveBlock.height) === atomicSwapConditions.receiveHeight) {
      assetCrawler.assetChain.push({
        state: 'pending_atomic_swap',
        type: 'receive#atomic_swap',
        account: recipient,
        owner: sender,
        locked: true,
        nanoBlock: receiveBlock,
        nanoBlockTraceLength: assetCrawler.nanoBlockTraceLength
      });
      return true;
    } else {
      // Atomic swap conditions were not met. Start chain from send#atomic_swap with new state.
      assetCrawler.assetChain.push({
        state: 'ownership',
        type: 'send#atomic_swap',
        account: sendAtomicSwap.account,
        owner: sendAtomicSwap.account,
        locked: false,
        nanoBlock: sendAtomicSwap.nanoBlock,
        nanoBlockTraceLength: assetCrawler.nanoBlockTraceLength
      });
      return true;
    }
  }

  return false;
}
