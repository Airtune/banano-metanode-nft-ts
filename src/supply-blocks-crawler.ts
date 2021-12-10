import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { NanoAccountBackwardCrawler } from "nano-account-crawler/dist/nano-account-backward-crawler";
import { NanoNode } from 'nano-account-crawler/dist/nano-node';

import { accountDataType } from "./account-data-type";
import { parseSupplyRepresentative } from "./block-parsers/supply";
import {
  MAX_RPC_ITERATIONS,
  META_PROTOCOL_SUPPORTED_VERSIONS,
} from "./constants";

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
  private validateSupplyBlock(block: INanoBlock, followedByBlock: INanoBlock): boolean {  
    // Only change blocks can serve as change#supply blocks.  
    if (block.subtype !== 'change') {
      return false;
    }
    
    // Must be followed by a mint block, i.e., any block that changes representative without matching an established representative header.
    if (followedByBlock === undefined) {
      return false;
    }
    if (block.representative === followedByBlock.representative) {
      return false;
    }

    // Mint block representative must not be special accounts or contain a data encoding header.
    if (accountDataType(followedByBlock.representative) !== "unknown") {
      return false;
    }

    // Check if representative is a parsable supply_representative with a supported version
    const supplyData = parseSupplyRepresentative(block.representative);
    if (!supplyData) {
      return false;
    }
    if (!META_PROTOCOL_SUPPORTED_VERSIONS.includes(supplyData.version)) {
      return false;
    }

    return true;
  }
}
