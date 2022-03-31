import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { TAssetBlockType } from "../types/asset-block-type";
import { TAssetState } from "../types/asset-state";

export interface IAssetBlock {
  state: TAssetState,
  type: TAssetBlockType,
  account: string, // account of frontier block (eg. receive#atomic_swap account during a swap)
  owner: string, // owner of asset (eg. send#atomic_swap account during a swap)
  locked: boolean, // whether the owner has power over the asset or not at the current block
  nanoBlock: INanoBlock,
  traceLength: bigint
}
