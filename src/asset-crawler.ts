// interfaces
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { IAssetBlock } from "./interfaces/asset-block";
import { IAtomicSwapConditions } from "./interfaces/atomic-swap-conditions";

// types
import { TAccount } from "./types/banano";

// packages
import { NanoNode } from 'nano-account-crawler/dist/nano-node';
import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";

// lib
import { bananoIpfs } from "./lib/banano-ipfs";

// meta node
import { MAX_TRACE_LENGTH } from "./constants";
import { parseAtomicSwapRepresentative } from "./block-parsers/atomic-swap";

// meta block states
import { assetMintCrawl } from "./asset-crawler-states/asset/first-mint";
import { ownedCrawl } from "./asset-crawler-states/asset/owned";
import { receivableCrawl } from "./asset-crawler-states/asset/receivable";
import { atomicSwapReceivableCrawl } from "./asset-crawler-states/atomic-swap/atomic-swap-receivable";
import { pendingPaymentCrawl } from "./asset-crawler-states/atomic-swap/atomic-swap-payable";
import { pendingDelegationCrawl } from "./asset-crawler-states/delegation/delegation-receivable";
import { delegatedCrawl } from "./asset-crawler-states/delegation/delegated";
import { delegatedAtomicSwapReceivableCrawl } from "./asset-crawler-states/delegation/delegated-atomic-swap-receivable";
import { delegatedAtomicSwapPayableCrawl } from "./asset-crawler-states/delegation/delegated-atomic-swap-payable";
import { returnToNFTSellerCrawl } from "./asset-crawler-states/return-to-nft-seller";

const assetCrawlerStates = {
  "owned": ownedCrawl,
  "receivable": receivableCrawl,
  "atomic_swap_receivable": atomicSwapReceivableCrawl,
  "atomic_swap_payable": pendingPaymentCrawl,
  "delegation_receivable": pendingDelegationCrawl,
  "delegated": delegatedCrawl,
  "delegated_atomic_swap_receivable": delegatedAtomicSwapReceivableCrawl,
  "delegated_atomic_swap_payable": delegatedAtomicSwapPayableCrawl,
  "(return_to_nft_seller)": returnToNFTSellerCrawl
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
    this._assetRepresentative = bananoIpfs.publicKeyToAccount(this._mintBlock.hash);
    this._metadataRepresentative = this._mintBlock.representative;
    this._traceLength = BigInt(1);

    await assetMintCrawl(this, this._mintBlock);

    while (await this.crawlStep()) {
      if (this._traceLength >= MAX_TRACE_LENGTH) {
        break;
      }
    }
  }

  private async crawlStep(): Promise<boolean> {
    const stateCrawlFn = assetCrawlerStates[this.frontier.state];

    if (typeof stateCrawlFn == "function") {
      return stateCrawlFn(this);
    } else {
      throw Error(`UnhandledAssetState: "${this.frontier.state}" was not handled for block: ${this.frontier.nanoBlock.hash}`);
    }
  }

  // Return minRaw for atomic swap payment if asset is ready for payment. Otherwise return undefined.
  public currentAtomicSwapConditions(): IAtomicSwapConditions | undefined {
    if (this.assetChain[this.assetChain.length - 1].state !== "atomic_swap_payable") {
      return undefined;
    }

    const sendAtomicSwap: IAssetBlock = this.findSendAtomicSwapBlock();
    if (sendAtomicSwap === undefined) { return undefined; }

    const atomicSwapRepresentative: TAccount = sendAtomicSwap.nanoBlock.representative as TAccount;
    const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(atomicSwapRepresentative);

    return atomicSwapConditions;
  }

  public findSendAtomicSwapBlock(): IAssetBlock | undefined {
    if (this.assetChain[this.assetChain.length - 2].state !== "atomic_swap_receivable") {
      return undefined;
    }

    const sendAtomicSwap: IAssetBlock = this.assetChain[this.assetChain.length - 2];
    return sendAtomicSwap;
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
