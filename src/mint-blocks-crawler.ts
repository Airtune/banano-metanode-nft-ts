import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { NanoAccountForwardCrawler } from 'nano-account-crawler/dist/nano-account-forward-crawler';
import { NanoNode } from 'nano-account-crawler/dist/nano-node';
import { bananoIpfs } from "./lib/banano-ipfs";
import { parseFinishSupplyRepresentative, parseSupplyRepresentative } from "./block-parsers/supply";
import { validateMintBlock } from "./block-validators/mint-block";
import { CANCEL_SUPPLY_REPRESENTATIVE, MAX_RPC_ITERATIONS } from "./constants";
import { IMintBlock } from "./interfaces/mint-block";
import { TAccount } from "./types/banano";

// Crawler to find all mint blocks for a specific supply block
export class MintBlocksCrawler {
  private _hasLimitedSupply: boolean;
  private _ipfsCID: string;
  private _issuer: string;
  private _nanoNode: NanoNode;
  private _nftSupplyBlock: INanoBlock;
  private _nftSupplyBlockHash: string;
  private _maxSupply: bigint;
  private _metadataRepresentative: string;
  private _mintBlocks: INanoBlock[];
  private _version: string;

  constructor(nanoNode: NanoNode, issuer: string, nftSupplyBlockHash: string) {
    this._nanoNode = nanoNode;
    this._issuer = issuer;
    this._nftSupplyBlockHash = nftSupplyBlockHash;
  }

  async crawl() {
    const banCrawler = new NanoAccountForwardCrawler(this._nanoNode, this._issuer, this._nftSupplyBlockHash);
    await banCrawler.initialize();
    banCrawler.maxRpcIterations = MAX_RPC_ITERATIONS;

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
        validateMintBlock(block as IMintBlock);
        this.parseFirstMint(block);
        this._mintBlocks.push(block);

      } else if (blockOffset > 1 && block.representative === this._metadataRepresentative) {
        validateMintBlock(block as IMintBlock);
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
    const supplyData = parseSupplyRepresentative(block.representative as TAccount);
    if (!supplyData) { return false }

    const { version, maxSupply } = supplyData;
    this._version = version;
    this._maxSupply = maxSupply;
    this._nftSupplyBlock = block;
    this._hasLimitedSupply = this._maxSupply > BigInt("0");
    return true;
  }

  private parseFinishSupplyBlock(block: INanoBlock): boolean {
    const finishSupplyData = parseFinishSupplyRepresentative(block.representative as TAccount);
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
