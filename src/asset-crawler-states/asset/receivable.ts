import { findReceiveBlock } from "../../lib/find-receive-block";
import { AssetCrawler } from "../../asset-crawler";

export async function receivableCrawl(assetCrawler: AssetCrawler): Promise<boolean> {
  const sendBlockHash = assetCrawler.frontier.nanoBlock.hash;
  const sender = assetCrawler.frontier.account;
  const recipient = assetCrawler.frontier.owner;
  const receiveBlock = await findReceiveBlock(sender, sendBlockHash, recipient);
  // guards
  if (typeof receiveBlock === 'undefined') { return false; }

  assetCrawler.traceLength += BigInt(1);

  if (receiveBlock.subtype === 'receive' && receiveBlock.link === sendBlockHash) {
    assetCrawler.assetChain.push({
      state: 'owned',
      type: 'receive#asset',
      account: recipient,
      owner: recipient,
      locked: false,
      nanoBlock: receiveBlock,
      traceLength: assetCrawler.traceLength
    });
    return true;
  }

  return false;
}
