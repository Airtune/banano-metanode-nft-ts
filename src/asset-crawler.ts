// interfaces
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { IMetaBlock } from "./interfaces/meta-block";
import { IAtomicSwapConditions } from "./interfaces/atomic-swap-conditions";

// packages
import { NanoNode } from 'nano-account-crawler/dist/nano-node';
import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";

// lib
import { bananoIpfs } from "./lib/banano-ipfs";

// meta node
import { MAX_NANO_BLOCK_TRACE_LENGTH } from "./constants";
import { parseAtomicSwapRepresentative } from "./atomic-swap-representative";

// meta block states
import { ownershipAddNextMetaBlock } from "./meta-block-states/ownership";
import { sendAddNextMetaBlock } from "./meta-block-states/send";
import { sendAtomicSwapAddNextMetaBlock } from "./meta-block-states/send-atomic-swap";
import { pendingAddNextMetaBlock } from "./meta-block-states/pending-atomic-swap";

// Crawler to trace the chain following a single mint of an asset.
export class AssetCrawler {
  private _assetChain: IMetaBlock[];
  private _assetRepresentative: string;
  private _metadataRepresentative: string;
  private _issuer: string;
  private _mintBlock: INanoBlock;
  private _nanoNode: NanoNode;
  private _nanoBlockTraceLength: bigint;

  constructor(nanoNode: NanoNode, issuer: string, mintBlock: INanoBlock) {
    this._issuer = issuer;
    this._nanoNode = nanoNode;
    this._mintBlock = mintBlock;
    this._assetChain = [];
    this._nanoBlockTraceLength = undefined;
  }

  async crawl() {
    await this.addMintBlockToAssetChain();
    this._assetRepresentative = bananoIpfs.publicKeyToAccount(this._mintBlock.hash);
    this._metadataRepresentative = this._mintBlock.representative;

    this._nanoBlockTraceLength = BigInt(1);

    while (await this.addNextFrontierToAssetChain()) {
      if (this._nanoBlockTraceLength >= MAX_NANO_BLOCK_TRACE_LENGTH) {
        break;
      }
    }
  }

  private async addMintBlockToAssetChain(): Promise<void> {
    if (this._mintBlock.subtype == 'send' && this._mintBlock.type === 'state') {
      this._assetChain.push({
        state: 'send',
        type: 'send#mint',
        account: this._issuer,
        owner: this._issuer,
        locked: false,
        nanoBlock: this._mintBlock,
        nanoBlockTraceLength: this._nanoBlockTraceLength
      });

    } else if (this._mintBlock.subtype == 'change' && this._mintBlock.type === 'state') {
      this._assetChain.push({
        state: 'ownership',
        type: 'change#mint',
        account: this._issuer,
        owner: this._issuer,
        locked: false,
        nanoBlock: this._mintBlock,
        nanoBlockTraceLength: this._nanoBlockTraceLength
      });

    } else {
      throw Error(`MintBlockError: Unexpected mint block subtype: ${this._mintBlock.subtype}. Expected 'send' or 'change'`);

    }
  }

  private async addNextFrontierToAssetChain(): Promise<boolean> {
    if (this.frontier.state == 'ownership') {
      return await ownershipAddNextMetaBlock(this);
    }

    if (this.frontier.state == 'send') {
      return await sendAddNextMetaBlock(this);
    }

    if (this.frontier.state == 'send_atomic_swap') {
      return await sendAtomicSwapAddNextMetaBlock(this);
    }

    if (this.frontier.state == 'pending_atomic_swap') {
      return await pendingAddNextMetaBlock(this);
    }

    throw Error(`UnhandledState: State: ${this.frontier.state} was not handled for block: ${this.frontier.nanoBlock.hash}`);
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

  public get nanoBlockTraceLength() {
    return this._nanoBlockTraceLength;
  }

  public set nanoBlockTraceLength(len: bigint) {
    this._nanoBlockTraceLength = len;
  }

  public get nanoNode() {
    return this._nanoNode;
  }
}
