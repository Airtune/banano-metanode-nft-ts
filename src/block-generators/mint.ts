import { TAccount, TBlockHash } from "../types/banano";
import { generateBananoChangeBlock } from './banano-change';
import { generateSendAssetBlock } from './send';

// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/mint_blocks.md
export const generateMintAndSendBlock = (metadataRepresentative: TAccount, sender: TAccount, recipient: TAccount, previous: string, balanceRaw: bigint) => {

  //The following implements the send block creation. Still need to implement the mint (changesupply & change#mintassets)
  return generateSendAssetBlock(metadataRepresentative, sender, recipient, previous, balanceRaw);
}

export const generateMintAndKeepBlock = (metadataRepresentative: TAccount, minterAccount: TAccount, previous: TBlockHash, balance: bigint) => {
  return generateBananoChangeBlock(minterAccount, metadataRepresentative, previous, balance);
}
