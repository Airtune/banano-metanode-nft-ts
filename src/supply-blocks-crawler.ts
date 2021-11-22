import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { NanoAccountBackwardCrawler } from "nano-account-crawler/dist/nano-account-backward-crawler";
import { NanoNode } from 'nano-account-crawler/dist/nano-node';

import { bananoIpfs } from "./lib/banano-ipfs";
import { parseFinishSupplyRepresentative, parseSupplyRepresentative } from "./block-parsers/supply";
import { validateMintBlock } from "./block-validators/mint-block";
import { CANCEL_SUPPLY_REPRESENTATIVE } from "./constants";

// Crawler to find all mint blocks for a specific supply block
export class SupplyBlocksCrawler {
  private _issuer: string;
  private _nanoNode: NanoNode;

  constructor(nanoNode: NanoNode, issuer: string) {
    this._nanoNode = nanoNode;
    this._issuer = issuer;
  }

  async crawl() {
    const banCrawler = new NanoAccountBackwardCrawler(this._nanoNode, this._issuer);
    await banCrawler.initialize();

    this._mintBlocks = [];
    let blockOffset: number = 0;

    // Crawl forward in issuer account from supply block
    for await (const block of banCrawler) {
      if (blockOffset === 0) {
        if (!this.parseSupplyBlock(block)) {
          throw Error(`SupplyBlockError: Unable to parse supply block: ${block.hash}`);
        }

      } else if (this.parseFinishSupplyBlock(block)) {
        break;

      } else if (blockOffset === 1) {
        if (block.representative === CANCEL_SUPPLY_REPRESENTATIVE) { break; };
        validateMintBlock(block);
        this.parseFirstMint(block);
        this._mintBlocks.push(block);

      } else if (blockOffset > 1 && block.representative === this._metadataRepresentative) {
        validateMintBlock(block);
        this._mintBlocks.push(block);

      }

      if (this.supplyExceeded()) {
        break;
      }
      blockOffset = blockOffset + 1;
    }
  }

  public get nftSupplyBlock() {
    return this._nftSupplyBlock;
  }

  public get mintBlocks() {
    return this._mintBlocks;
  }

  public get ipfsCID() {
    return this._ipfsCID;
  }

  public get version() {
    return this._version;
  }

  public get maxSupply() {
    return this._maxSupply;
  }

  public get hasLimitedSupply() {
    return this._hasLimitedSupply;
  }

  private parseSupplyBlock(block: INanoBlock): boolean {
    const supplyData = parseSupplyRepresentative(block.representative);
    if (!supplyData) { return false }

    const { version, maxSupply } = supplyData;
    this._version = version;
    this._maxSupply = maxSupply;
    this._nftSupplyBlock = block;
    this._hasLimitedSupply = this._maxSupply > BigInt("0");
    return true;
  }

  private parseFinishSupplyBlock(block: INanoBlock): boolean {
    const finishSupplyData = parseFinishSupplyRepresentative(block.representative);
    if (!finishSupplyData) {
      return false;
    }

    const { supplyBlockHeight } = finishSupplyData;
    return supplyBlockHeight === BigInt(this._nftSupplyBlock.height);
  }

  private parseFirstMint(block: INanoBlock) {
    this._metadataRepresentative = block.representative;
    this._ipfsCID = bananoIpfs.accountToIpfsCidV0(this._metadataRepresentative);
  }

  private supplyExceeded(): boolean {
    return this._hasLimitedSupply && BigInt(this._mintBlocks.length) >= this._maxSupply;
  }
}
