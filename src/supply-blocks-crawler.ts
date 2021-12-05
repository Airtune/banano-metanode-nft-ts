import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { NanoAccountBackwardCrawler } from "nano-account-crawler/dist/nano-account-backward-crawler";
import { NanoNode } from 'nano-account-crawler/dist/nano-node';

import { parseSupplyRepresentative } from "./block-parsers/supply";
import { CANCEL_SUPPLY_REPRESENTATIVE, MAX_RPC_ITERATIONS } from "./constants";

// Crawler to find all supply blocks by an issuer
export class SupplyBlocksCrawler {
  private _issuer: string;
  private _nanoNode: NanoNode;

  constructor(nanoNode: NanoNode, issuer: string) {
    this._nanoNode = nanoNode;
    this._issuer = issuer;
  }

  async crawl(): Promise<INanoBlock[]> {
    // Initialize crawler that crawls backward from account frontier
    const banCrawler = new NanoAccountBackwardCrawler(this._nanoNode, this._issuer);
    await banCrawler.initialize();
    banCrawler.maxRpcIterations = MAX_RPC_ITERATIONS;

    const supplyBlocks: INanoBlock[] = [];
    let followedByBlock: INanoBlock = undefined;

    // Crawl backward from frontier in issuer account
    for await (const block of banCrawler) {
      if (this.validateSupplyBlock(block, followedByBlock)) {
        supplyBlocks.push(block);
      }

      // Cache followedByBlock that is ahead of block in next iteration
      followedByBlock = block;
    }

    return supplyBlocks;
  }

  // https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/supply_block.md#validation
  private validateSupplyBlock(block: INanoBlock, followedByBlock: INanoBlock) {
    // supply block isn't confirmed if it's the frontier of the account
    if (followedByBlock === undefined) {
      return false;
    }
    
    // invalid if followed by a #cancel_supply block
    if (followedByBlock.representative === CANCEL_SUPPLY_REPRESENTATIVE) {
      return false;
    }

    // invalid if followed by a #supply block
    if (parseSupplyRepresentative(followedByBlock.representative)) {
      return false;
    }

    const supplyData = parseSupplyRepresentative(block.representative);
    if (supplyData) {
      return true;
    } else {
      return false;
    }
  }
}
