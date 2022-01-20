import { findReceiveBlock } from "../../lib/find-receive-block";
import { AssetCrawler } from "../../asset-crawler";

export async function receivableAddNextAssetBlock(assetCrawler: AssetCrawler): Promise<boolean> {
  const sendBlockHash = assetCrawler.frontier.nanoBlock.hash;
  const recipient = assetCrawler.frontier.nanoBlock.account;
  const receiveBlock = await findReceiveBlock(assetCrawler.frontier.account, sendBlockHash, recipient);
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
