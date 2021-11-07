import { findReceiveBlock } from "../lib/find-receive-block";
import { AssetCrawler } from "../asset-crawler";

export async function sendAddNextMetaBlock(assetCrawler: AssetCrawler): Promise<boolean> {
  const sendBlockHash = assetCrawler.frontier.nanoBlock.hash;
  const recipient = assetCrawler.frontier.nanoBlock.account;
  const receiveBlock = await findReceiveBlock(assetCrawler.frontier.account, sendBlockHash, recipient);
  assetCrawler.nanoBlockTraceLength = assetCrawler.nanoBlockTraceLength + BigInt(1);

  if (typeof receiveBlock !== 'undefined' && receiveBlock.subtype === 'receive' && receiveBlock.link === sendBlockHash) {
    assetCrawler.assetChain.push({
      state: 'ownership',
      type: 'receive#asset',
      account: recipient,
      owner: recipient,
      locked: false,
      nanoBlock: receiveBlock,
      nanoBlockTraceLength: assetCrawler.nanoBlockTraceLength
    });
    return true;
  }

  

  return false;
}
