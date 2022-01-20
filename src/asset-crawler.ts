// interfaces
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { IAssetBlock } from "./interfaces/asset-block";
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
import { firstMintAddNextAssetBlocks } from "./asset-crawler-states/asset/first-mint";
import { ownedAddNextAssetBlock } from "./asset-crawler-states/asset/owned";
import { receivableAddNextAssetBlock } from "./asset-crawler-states/asset/receivable";
import { atomicSwapReceivableAddNextAssetBlock } from "./asset-crawler-states/atomic-swap/atomic-swap-receivable";
import { pendingPaymentAddNextAssetBlock } from "./asset-crawler-states/atomic-swap/atomic-swap-payable";
import { pendingDelegationAddNextAssetBlock } from "./asset-crawler-states/delegation/delegation-receivable";
import { delegatedAddNextAssetBlock } from "./asset-crawler-states/delegation/delegated";
import { delegatedAtomicSwapReceivableAddNextAssetBlock } from "./asset-crawler-states/delegation/delegated-atomic-swap-receivable";
import { delegatedAtomicSwapPayableAddNextAssetBlock } from "./asset-crawler-states/delegation/delegated-atomic-swap-payable";

const addNextAssetBlockForState = {
  "owned": ownedAddNextAssetBlock,
  "receivable": receivableAddNextAssetBlock,
  "atomic_swap_receivable": atomicSwapReceivableAddNextAssetBlock,
  "atomic_swap_payable": pendingPaymentAddNextAssetBlock,
  "delegation_receivable": pendingDelegationAddNextAssetBlock,
  "delegated": delegatedAddNextAssetBlock,
  "delegated_atomic_swap_receivable": delegatedAtomicSwapReceivableAddNextAssetBlock,
  "delegated_atomic_swap_payable": delegatedAtomicSwapPayableAddNextAssetBlock
};

// Crawler to trace the chain following a single mint of an asset.
export class AssetCrawler {
  private _assetChain: IAssetBlock[];
  private _assetRepresentative: string;
  private _metadataRepresentative: string;
  private _issuer: string;
  private _mintBlock: INanoBlock;
  private _nanoNode: NanoNode;
  private _traceLength: bigint;

  public activeAtomicSwap: IAssetBlock;
  public activeAtomicSwapDelegation: IAssetBlock;
  public owner: string;
  public locked: boolean;
  public lockedInAccount: string;

  constructor(nanoNode: NanoNode, issuer: string, mintBlock: INanoBlock) {
    this._issuer = issuer;
    this._nanoNode = nanoNode;
    this._mintBlock = mintBlock;
    this._assetChain = [];
    this._traceLength = undefined;
  }

  async crawl() {
    await firstMintAddNextAssetBlocks(this, this._mintBlock);
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
    const addNextAssetBlock = addNextAssetBlockForState[this.frontier.state];

    if (typeof addNextAssetBlock == "function") {
      return addNextAssetBlock(this);
    } else {
      throw Error(`UnhandledAssetState: "${this.frontier.state}" was not handled for block: ${this.frontier.nanoBlock.hash}`);
    }
  }

  public get assetChain() {
    return this._assetChain;
  }

  public get frontier(): IAssetBlock {
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
