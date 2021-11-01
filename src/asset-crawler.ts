import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { NanoNode } from 'nano-account-crawler/dist/nano-node';
import * as bananojs from '@bananocoin/bananojs';
import { bananoIpfs } from "./lib/banano-ipfs";
import { findReceiveBlock } from "./lib/find-receive-block";
import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";
import { IMetaBlock } from "./interfaces/meta-block";

// Crawler to trace the chain following a single mint of an asset.
export class AssetCrawler {
  private _assetChain: IMetaBlock[];
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
    this._metadataRepresentative = bananoIpfs.publicKeyToAccount(this._mintBlock.hash);

    await this.parseAssetChainFromMintBlock();

    let frontier: IMetaBlock;
    let frontierCrawler: NanoAccountForwardCrawler;

    frontier = this._assetChain[this._assetChain.length - 1];
    frontierCrawler = new NanoAccountForwardCrawler(this._nanoNode, frontier.account, frontier.nanoBlock.hash, "1");

    // TODO: Loop through each account and find next meta block
    /*
    // trace forward in account history from frontier block
    for await (const block of frontierCrawler) {
      if (block.representative) {

      }
    }
    */
  }

  private async parseAssetChainFromMintBlock() {
    if (this._mintBlock.subtype == 'send') {
      const recipient = this._mintBlock.account;
      const blockHash = this._mintBlock.hash;
      const receiveBlock = await findReceiveBlock(this._issuer, blockHash, recipient);
      if (typeof receiveBlock !== 'undefined') {
        this._assetChain.push(
          {
            type: 'mint_and_send',
            account: this._issuer,
            nanoBlock: this._mintBlock
          },
          {
            type: 'receive',
            account: recipient,
            nanoBlock: receiveBlock
          }
        );
      }

    } else if (this._mintBlock.subtype == 'change') {
      this._assetChain.push({
        type: 'mint',
        account: this._issuer,
        nanoBlock: this._mintBlock
      });

    } else {
      throw Error(`MintBlockError: Unexpected mint block subtype: ${this._mintBlock.subtype}. Expected 'send' or 'change'`);

    }
  }

  public get issuer() {
    return this._issuer;
  }

  public get metadataRepresentative() {
    return this._metadataRepresentative;
  }
}
