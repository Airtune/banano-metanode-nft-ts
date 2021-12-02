import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { NanoAccountBackwardCrawler } from "nano-account-crawler/dist/nano-account-backward-crawler";
import { NanoNode } from 'nano-account-crawler/dist/nano-node';

import { parseSupplyRepresentative } from "./block-parsers/supply";
import { CANCEL_SUPPLY_REPRESENTATIVE, MAX_RPC_ITERATIONS } from "./constants";

// Crawler to find all mint blocks for a specific supply block
export class SupplyBlocksCrawler {
  private _issuer: string;
  private _nanoNode: NanoNode;

  constructor(nanoNode: NanoNode, issuer: string) {
    this._nanoNode = nanoNode;
    this._issuer = issuer;
  }

  async crawl(): Promise<INanoBlock[]> {
    const banCrawler = new NanoAccountBackwardCrawler(this._nanoNode, this._issuer);
    await banCrawler.initialize();
    banCrawler.maxRpcIterations = MAX_RPC_ITERATIONS;

    const supplyBlocks: INanoBlock[] = [];
    let followingBlock: INanoBlock = undefined;

    // Crawl forward in issuer account from supply block
    for await (const block of banCrawler) {
      const supplyData = parseSupplyRepresentative(block.representative);
      
      // if there's no subsequent block, mint or cancel, don't add the supply block to the list yet.
      if (supplyData && followingBlock !== undefined) {
        const followedByCancelBlock = followingBlock.representative == CANCEL_SUPPLY_REPRESENTATIVE;
        const followedBySupplyBlock = parseSupplyRepresentative(followingBlock.representative);
        
        if (!followedByCancelBlock && !followedBySupplyBlock) {
          supplyBlocks.push(block);
        }
      }

      followingBlock = block;
    }

    return supplyBlocks;
  }
}
