import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { NanoNode } from 'nano-account-crawler/dist/nano-node';
import * as bananojs from '@bananocoin/bananojs';
import { bananoIpfs } from "./lib/banano-ipfs";
import { findReceiveBlock } from "./lib/find-receive-block";
import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";
import { IMetaBlock } from "./interfaces/meta-block";
import { nextTick } from "process";

// Crawler to trace the chain following a single mint of an asset.
export class AssetCrawler {
  private _assetChain: IMetaBlock[];
  private _assetRepresentative: string;
  private _metadataRepresentative: string;
  private _issuer: string;
  private _mintBlock: INanoBlock;
  private _nanoNode: NanoNode;

  constructor(nanoNode: NanoNode, issuer: string, mintBlock: INanoBlock) {
    this._issuer = issuer;
    this._nanoNode = nanoNode;
    this._mintBlock = mintBlock;
    this._assetChain = [];
  }

  async crawl() {
    await this.parseAssetChainFromMintBlock();
    this._assetRepresentative = bananoIpfs.publicKeyToAccount(this._mintBlock.hash);
    this._metadataRepresentative = this._mintBlock.representative;

    let frontierCrawler = new NanoAccountForwardCrawler(this._nanoNode, this.frontier.account, this.frontier.nanoBlock.hash, "1");

    // trace forward in account history from frontier block
    for await (const nanoBlock of frontierCrawler) {
      const metaBlockType = this.identifyMetaBlockType(nanoBlock, this.frontier);
      if (metaBlockType == undefined) { continue; }

      const [nanotype, metaAction] = metaBlockType.split('#');

      if (metaBlockType === 'send#asset') {
        this._assetChain.push({
          type: metaBlockType,
          account: this.frontier.account,
          nanoBlock: nanoBlock
        });
        break;
      }

      if (metaAction === 'finish_supply') {
        this._assetChain.push({
          type: metaBlockType,
          account: this.frontier.account,
          nanoBlock: nanoBlock
        });
        break;
      }
    }
  }

  private async parseAssetChainFromMintBlock(): Promise<void> {
    if (this._mintBlock.subtype == 'send' && this._mintBlock.type === 'state') {
      this._assetChain.push({
        type: 'send#mint',
        account: this._issuer,
        nanoBlock: this._mintBlock
      });

      const blockHash = this._mintBlock.hash;
      const recipient = this._mintBlock.account;
      const receiveBlock = await findReceiveBlock(this._issuer, blockHash, recipient);
      if (typeof receiveBlock !== 'undefined') {
        this._assetChain.push({
          type: 'receive#asset',
          account: recipient,
          nanoBlock: receiveBlock
        });
      }

    } else if (this._mintBlock.subtype == 'change' && this._mintBlock.type === 'state') {
      this._assetChain.push({
        type: 'change#mint',
        account: this._issuer,
        nanoBlock: this._mintBlock
      });

    } else {
      throw Error(`MintBlockError: Unexpected mint block subtype: ${this._mintBlock.subtype}. Expected 'send' or 'change'`);

    }
  }

  private identifyMetaBlockType(block: INanoBlock, frontier: IMetaBlock): (string|undefined) {
    if (frontier.type === 'receive#asset' || frontier.type === 'change#mint' || frontier.type === 'send#payment') {
      if (block.representative === this._assetRepresentative && block.subtype === 'send' && block.type === 'state') {
        return 'send#asset';
      }

      if (block.representative === this._assetRepresentative && block.subtype === 'send' && block.type === 'state') {
        return 'send#asset';
      }
    }

    return undefined;
  }

  public get assetChain() {
    return this._assetChain;
  }

  public get frontier() {
    return this._assetChain[this._assetChain.length - 1];
  }

  public get assetRepresentative() {
    return this._assetRepresentative;
  }

  public get issuer() {
    return this._issuer;
  }

  public get metadataRepresentative() {
    return this._metadataRepresentative;
  }
}
