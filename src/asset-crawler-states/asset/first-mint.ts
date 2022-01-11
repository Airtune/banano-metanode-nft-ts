import { AssetCrawler } from "../../asset-crawler";
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";

export async function firstMintAddNextAssetBlocks(assetCrawler: AssetCrawler, _mintBlock: INanoBlock): Promise<boolean> {
  if (_mintBlock.subtype == 'send' && _mintBlock.type === 'state') {
    assetCrawler.assetChain.push({
      state: 'receivable',
      type: 'send#mint',
      account: assetCrawler.issuer,
      owner: assetCrawler.issuer,
      locked: false,
      nanoBlock: _mintBlock,
      traceLength: assetCrawler.traceLength
    });
    return true;

  } else if (_mintBlock.subtype == 'change' && _mintBlock.type === 'state') {
    assetCrawler.assetChain.push({
      state: 'owned',
      type: 'change#mint',
      account: assetCrawler.issuer,
      owner: assetCrawler.issuer,
      locked: false,
      nanoBlock: _mintBlock,
      traceLength: assetCrawler.traceLength
    });
    return true;

  } else {
    throw Error(`MintBlockError: Unexpected mint block subtype: ${_mintBlock.subtype}. Expected 'send' or 'change'`);

  }
}
