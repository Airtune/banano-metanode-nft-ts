import { TAccount, TBlockHash } from "../types/banano";

export interface IMintBlock {
  type: string, subtype: string, representative: TAccount, hash: TBlockHash
}
