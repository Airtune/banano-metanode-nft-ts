import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { NanoAccountForwardCrawler } from 'nano-account-crawler/dist/nano-account-forward-crawler';
import { NanoNode } from 'nano-account-crawler/dist/nano-node';
import { bananoIpfs } from "./lib/banano-ipfs";
import { parseSupplyRepresentative } from "./supply-block";
import { validateMintBlock, isCancelSupplyBlock } from "./mint-block";

// Crawler to find all mint blocks for a specific supply block
export class MintBlocksCrawler {
  private _assetRepresentative: string;
  private _hasLimitedSupply: boolean;
  private _ipfsCID: string;
  private _issuer: string;
  private _nanoNode: NanoNode;
  private _nftSupplyBlock: INanoBlock;
  private _nftSupplyBlockHash: string;
  private _maxSupply: BigInt;
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

    this._mintBlocks = [];
    let blockOffset: number = 0;

    // Crawl forward in issuer account from supply block
    for await (const block of banCrawler) {
      if (blockOffset === 0) {
        this.parseSupplyBlock(block);

      } else if (blockOffset === 1) {
        if (isCancelSupplyBlock(block)) { break; };
        validateMintBlock(block);
        this.parseFirstMint(block);
        this._mintBlocks.push(block);

      } else if (blockOffset > 1 && block.representative === this._assetRepresentative) {
        validateMintBlock(block);
        this._mintBlocks.push(block);

      }

      if (this.supplyExceeded()) { break; }
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

  private parseSupplyBlock(block: INanoBlock) {
    const { version, maxSupply } = parseSupplyRepresentative(block.representative);
    this._version = version;
    this._maxSupply = maxSupply;
    this._nftSupplyBlock = block;
    this._hasLimitedSupply = this._maxSupply > BigInt("0");
  }

  private parseFirstMint(block: INanoBlock) {
    this._assetRepresentative = block.representative;
    this._ipfsCID = bananoIpfs.accountToIpfsCidV0(this._assetRepresentative);
  }

  private supplyExceeded(): boolean {
    return this._hasLimitedSupply && BigInt(this._mintBlocks.length) >= this._maxSupply;
  }
}
