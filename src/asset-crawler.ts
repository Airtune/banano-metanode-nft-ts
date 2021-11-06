import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { NanoNode } from 'nano-account-crawler/dist/nano-node';
import * as bananojs from '@bananocoin/bananojs';
import { bananoIpfs } from "./lib/banano-ipfs";
import { findReceiveBlock } from "./lib/find-receive-block";
import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";
import { IMetaBlock } from "./interfaces/meta-block";
import { nextMetaBlockType } from "./next-meta-block-type";
import { MAX_NANO_BLOCK_TRACE_LENGTH } from "./constants";
import { parseAtomicSwapRepresentative } from "./atomic-swap-representative";
import { IAtomicSwapConditions } from "./interfaces/atomic-swap-conditions";

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
    await this.addMintBlockToAssetChain();
    this._assetRepresentative = bananoIpfs.publicKeyToAccount(this._mintBlock.hash);
    this._metadataRepresentative = this._mintBlock.representative;

    let nanoBlockTraceLength = 2;

    while (await this.addNextFrontierToAssetChain()) {
      nanoBlockTraceLength = nanoBlockTraceLength + 1;
      if (nanoBlockTraceLength >= MAX_NANO_BLOCK_TRACE_LENGTH) {
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
        nanoBlock: this._mintBlock
      });

    } else if (this._mintBlock.subtype == 'change' && this._mintBlock.type === 'state') {
      this._assetChain.push({
        state: 'ownership',
        type: 'change#mint',
        account: this._issuer,
        owner: this._issuer,
        locked: false,
        nanoBlock: this._mintBlock
      });

    } else {
      throw Error(`MintBlockError: Unexpected mint block subtype: ${this._mintBlock.subtype}. Expected 'send' or 'change'`);

    }
  }

  private async addNextFrontierToAssetChain() {
    if (this.frontier.state == 'ownership') {
      // trace forward in account history from frontier block
      let frontierCrawler = new NanoAccountForwardCrawler(this._nanoNode, this.frontier.account, this.frontier.nanoBlock.hash, "1");
      for await (const nanoBlock of frontierCrawler) {
        const metaBlockType = nextMetaBlockType(this, nanoBlock);
        if (metaBlockType == undefined) { continue; }

        if (metaBlockType === 'send#asset') {
          this._assetChain.push({
            state: 'send',
            type: metaBlockType,
            account: this.frontier.account,
            owner: nanoBlock.account,
            locked: false,
            nanoBlock: nanoBlock
          });
          return true;
        }

        if (metaBlockType === 'send#atomic_swap') {
          this._assetChain.push({
            state: 'send_atomic_swap',
            type: metaBlockType,
            account: this.frontier.account,
            owner: this.frontier.account,
            locked: true,
            nanoBlock: nanoBlock
          });
          return true;
        }
      }
    }

    if (this.frontier.state == 'send') {
      const blockHash = this.frontier.nanoBlock.hash;
      const recipient = this.frontier.nanoBlock.account;
      const receiveBlock = await findReceiveBlock(this.frontier.account, blockHash, recipient);
      if (typeof receiveBlock !== 'undefined') {
        this._assetChain.push({
          state: 'ownership',
          type: 'receive#asset',
          account: recipient,
          owner: recipient,
          locked: false,
          nanoBlock: receiveBlock
        });
        return true;
      }
    }

    if (this.frontier.state == 'send_atomic_swap') {
      const sendAtomicSwap = this.frontier;
      const blockHash = this.frontier.nanoBlock.hash;
      const sender = this.frontier.account;
      const recipient = this.frontier.nanoBlock.account;
      const receiveBlock = await findReceiveBlock(sender, blockHash, recipient);
      const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(sendAtomicSwap.nanoBlock.representative);
      if (atomicSwapConditions && typeof receiveBlock !== 'undefined' && BigInt(receiveBlock.height) === atomicSwapConditions.receiveHeight) {
        this._assetChain.push({
          state: 'pending_atomic_swap',
          type: 'receive#atomic_swap',
          account: recipient,
          owner: sender,
          locked: true,
          nanoBlock: receiveBlock
        });
        return true;
      } else {
        // Atomic swap conditions were not met. Start chain from send#atomic_swap with new state.
        this._assetChain.push({
          state: 'ownership',
          type: 'send#atomic_swap',
          account: sendAtomicSwap.account,
          owner: sendAtomicSwap.account,
          locked: false,
          nanoBlock: sendAtomicSwap.nanoBlock
        });
        return true;
      }
    }

    if (this.frontier.state == 'pending_atomic_swap') {
      // TODO: Optimize request.
      const frontierCrawler = new NanoAccountForwardCrawler(this._nanoNode, this.frontier.account, this.frontier.nanoBlock.hash, "1");
      const sendAtomicSwap = this._assetChain[this.assetChain.length - 2];

      if (sendAtomicSwap.state === 'send_atomic_swap') {
        const atomicSwapConditions: IAtomicSwapConditions = parseAtomicSwapRepresentative(sendAtomicSwap.nanoBlock.representative);
        if (atomicSwapConditions) {
          for await (const nanoBlock of frontierCrawler) {
            if (nanoBlock.subtype === 'send' && nanoBlock.account === sendAtomicSwap.account && BigInt(nanoBlock.amount) >= atomicSwapConditions.minRaw) {
              this._assetChain.push({
                state: 'ownership',
                type: 'send#payment',
                account: this.frontier.account,
                owner: this.frontier.account,
                locked: false,
                nanoBlock: nanoBlock
              });
              return true;
            }
          }
        }

        // Atomic swap conditions were not met. Start chain from send#atomic_swap with new state.
        this._assetChain.push({
          state: 'ownership',
          type: 'send#atomic_swap',
          account: sendAtomicSwap.account,
          owner: sendAtomicSwap.account,
          locked: false,
          nanoBlock: sendAtomicSwap.nanoBlock
        });
        return true;
      }
    }

    return false;
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
