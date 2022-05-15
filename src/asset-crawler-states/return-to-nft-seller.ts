// interfaces
import { IAssetBlock } from "../interfaces/asset-block";

// src
import { AssetCrawler } from "../asset-crawler";

export async function returnToNFTSellerCrawl(assetCrawler: AssetCrawler): Promise<boolean> {
  const assetChain: IAssetBlock[] = assetCrawler.assetChain;

  const sendAtomicSwapBlock = _findSenderBlock(assetChain);

  let frontier: IAssetBlock = {
    state: "owned",
    type: "send#returned_to_sender",
    account: sendAtomicSwapBlock.account,
    owner: sendAtomicSwapBlock.account,
    locked: false,
    nanoBlock: sendAtomicSwapBlock.nanoBlock,
    traceLength: assetCrawler.traceLength
  };
  
  return true;
}

function _findSenderBlock(assetChain: IAssetBlock[]): IAssetBlock {
  for (let i = assetChain.length - 1; i >= 0; i--) {
    const block: IAssetBlock = assetChain[i];
    if (["atomic_swap_receivable", "delegated_atomic_swap_receivable"].includes(block.state)) {
      return block;
    }
  }

  throw Error(`Unabled to find atomic_swap_receivable or delegated_atomic_swap_receivable for asset: ${assetChain[0].nanoBlock.hash}`);;
}
