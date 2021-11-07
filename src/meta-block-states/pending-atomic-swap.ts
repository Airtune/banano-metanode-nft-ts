import { IAtomicSwapConditions } from "../interfaces/atomic-swap-conditions";

import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";

import { AssetCrawler } from "../asset-crawler";
import { parseAtomicSwapRepresentative } from "../atomic-swap-representative";

export async function pendingAddNextMetaBlock(assetCrawler: AssetCrawler): Promise<boolean> {
  // TODO: Optimize request.
  const frontierCrawler = new NanoAccountForwardCrawler(assetCrawler.nanoNode, assetCrawler.frontier.account, assetCrawler.frontier.nanoBlock.hash, "1", undefined, 1);
  const sendAtomicSwap = assetCrawler.assetChain[assetCrawler.assetChain.length - 2];

  if (sendAtomicSwap.state === 'send_atomic_swap') {
    const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(sendAtomicSwap.nanoBlock.representative);
    
    for await (const nanoBlock of frontierCrawler) {
      assetCrawler.nanoBlockTraceLength = assetCrawler.nanoBlockTraceLength + BigInt(1);
      if (nanoBlock.subtype === 'send' && nanoBlock.account === sendAtomicSwap.account && BigInt(nanoBlock.amount) >= atomicSwapConditions.minRaw) {
        // Atomic swap conditions were met.
        assetCrawler.assetChain.push({
          state: 'ownership',
          type: 'send#payment',
          account: assetCrawler.frontier.account,
          owner: assetCrawler.frontier.account,
          locked: false,
          nanoBlock: nanoBlock,
          nanoBlockTraceLength: assetCrawler.nanoBlockTraceLength
        });
        return true;
      } else if (!!nanoBlock && nanoBlock.subtype) {
        // Atomic swap conditions were not met.
        // Continue chain from send#atomic_swap again with state 'ownership' instead of state 'send_atomic_swap'.
        assetCrawler.assetChain.push({
          state: 'cancel_atomic_swap',
          type: `${nanoBlock.subtype}#cancel_atomic_swap`,
          account: assetCrawler.frontier.account,
          owner: sendAtomicSwap.account,
          locked: false,
          nanoBlock: nanoBlock,
          nanoBlockTraceLength: assetCrawler.nanoBlockTraceLength
        });
        assetCrawler.nanoBlockTraceLength = assetCrawler.nanoBlockTraceLength + BigInt(1);
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

  throw Error(`UnexpectedMetaChain: Expected states of the chain to be send_atomic_swap -> pending_atomic_swap -> x. Got: ${sendAtomicSwap.state} -> ${assetCrawler.frontier.state} -> x.`);
}
