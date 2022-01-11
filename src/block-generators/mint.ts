import * as bananojs from '@bananocoin/bananojs';
import { generateBananoChangeBlock } from './banano-change';
import { generateSendAssetBlock } from './send';

// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/mint_blocks.md
export const generateMintAndSendBlock = (metadataRepresentative: string, sender: string, recipient: string, previous: string, balanceRaw: bigint) => {

  //The following implements the send block creation. Still need to implement the mint (changesupply & change#mintassets)
  return generateSendAssetBlock(metadataRepresentative, sender, recipient, previous, balanceRaw);
}

export const generateMintAndKeepBlock = (metadataRepresentative: string, minterAccount: string, previous: string, balance: bigint) => {
  return generateBananoChangeBlock(minterAccount, metadataRepresentative, previous, balance);
}
