import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { TAssetBlockType } from "../types/asset-block-type";
import { TAssetState } from "../types/asset-state";

export interface IAssetBlock {
  state: TAssetState,
  type: TAssetBlockType,
  account: string,
  owner: string,
  locked: boolean,
  nanoBlock: INanoBlock,
  traceLength: bigint
}
