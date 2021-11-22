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
import { MAX_TRACE_LENGTH } from "./constants";
import { parseAtomicSwapRepresentative } from "./block-parsers/atomic-swap";

// meta block states
import { firstMintAddNextMetaBlocks } from "./asset-crawler-states/first-mint";
import { ownershipAddNextMetaBlock } from "./asset-crawler-states/ownership";
import { sendAddNextMetaBlock } from "./asset-crawler-states/send";
import { sendAtomicSwapAddNextMetaBlock } from "./asset-crawler-states/send-atomic-swap";
import { pendingAddNextMetaBlock } from "./asset-crawler-states/pending-atomic-swap";

const addNextMetaBlockForState = {
  "ownership": ownershipAddNextMetaBlock,
  "send": sendAddNextMetaBlock,
  "send_atomic_swap": sendAtomicSwapAddNextMetaBlock,
  "pending_atomic_swap": pendingAddNextMetaBlock
};

// Crawler to trace the chain following a single mint of an asset.
export class AssetCrawler {
  private _assetChain: IMetaBlock[];
  private _assetRepresentative: string;
  private _metadataRepresentative: string;
  private _issuer: string;
  private _mintBlock: INanoBlock;
  private _nanoNode: NanoNode;
  private _traceLength: bigint;

  constructor(nanoNode: NanoNode, issuer: string, mintBlock: INanoBlock) {
    this._issuer = issuer;
    this._nanoNode = nanoNode;
    this._mintBlock = mintBlock;
    this._assetChain = [];
    this._traceLength = undefined;
  }

  async crawl() {
    await firstMintAddNextMetaBlocks(this, this._mintBlock);
    this._assetRepresentative = bananoIpfs.publicKeyToAccount(this._mintBlock.hash);
    this._metadataRepresentative = this._mintBlock.representative;
    this._traceLength = BigInt(1);

    while (await this.addNextFrontierToAssetChain()) {
      if (this._traceLength >= MAX_TRACE_LENGTH) {
        break;
      }
    }
  }

  private async addNextFrontierToAssetChain(): Promise<boolean> {
    const addNextMetaBlock = addNextMetaBlockForState[this.frontier.state];

    if (typeof addNextMetaBlock == "function") {
      return addNextMetaBlock(this);
    } else {
      throw Error(`UnhandledState: State: ${this.frontier.state} was not handled for block: ${this.frontier.nanoBlock.hash}`);
    }
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

  public get traceLength() {
    return this._traceLength;
  }

  public set traceLength(len: bigint) {
    this._traceLength = len;
  }

  public get nanoNode() {
    return this._nanoNode;
  }
}
