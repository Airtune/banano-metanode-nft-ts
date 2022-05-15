// dependencies
import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { NanoAccountForwardCrawler } from "nano-account-crawler/dist/nano-account-forward-crawler";

// interfaces
import { IAssetBlock } from "../../interfaces/asset-block";
import { IAtomicSwapConditions } from "../../interfaces/atomic-swap-conditions";

// types
import { TAssetState } from "../../types/asset-state";
import { TAssetBlockType } from "../../types/asset-block-type";

// constants
import { BURN_ACCOUNTS } from "../../constants";

// src
import { AssetCrawler } from "../../asset-crawler";
import { parseAtomicSwapRepresentative } from "../../block-parsers/atomic-swap";
import { TAccount } from "../../types/banano";

// State for when the the block's account own the asset.
export async function burnedCrawl(assetCrawler: AssetCrawler): Promise<boolean> {
  return false;
}
