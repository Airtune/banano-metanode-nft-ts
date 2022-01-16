import { TAccount, TBlockHash } from "../types/banano";

export interface IMetadataJSON {
  name: string;
  description: string;
  image: string;
  properties: {
    issuer: string,
    supply_block_hash: TBlockHash,
    tips: { name: string, account: TAccount }[]
  }
}
