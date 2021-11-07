import { nextMetaBlockType } from "../next-meta-block-type";
import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";
import { AssetCrawler } from "../asset-crawler";

export async function ownershipAddNextMetaBlock(assetCrawler: AssetCrawler): Promise<boolean> {
  // trace forward in account history from frontier block
  let frontierCrawler = new NanoAccountForwardCrawler(assetCrawler.nanoNode, assetCrawler.frontier.account, assetCrawler.frontier.nanoBlock.hash, "1");
  for await (const nanoBlock of frontierCrawler) {
    assetCrawler.nanoBlockTraceLength = assetCrawler.nanoBlockTraceLength + BigInt(1);
    const metaBlockType = nextMetaBlockType(assetCrawler, nanoBlock);
    if (metaBlockType == undefined) { continue; }

    if (metaBlockType === 'send#asset') {
      assetCrawler.assetChain.push({
        state: 'send',
        type: metaBlockType,
        account: assetCrawler.frontier.account,
        owner: nanoBlock.account,
        locked: false,
        nanoBlock: nanoBlock,
        nanoBlockTraceLength: assetCrawler.nanoBlockTraceLength
      });
      return true;
    }

    if (metaBlockType === 'send#atomic_swap') {
      assetCrawler.assetChain.push({
        state: 'send_atomic_swap',
        type: metaBlockType,
        account: assetCrawler.frontier.account,
        owner: assetCrawler.frontier.account,
        locked: true,
        nanoBlock: nanoBlock,
        nanoBlockTraceLength: assetCrawler.nanoBlockTraceLength
      });
      return true;
    }
  }

  return false;
}
