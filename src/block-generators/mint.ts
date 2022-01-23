import { TAccount, TBlockHash } from "../types/banano";
import { generateBananoChangeBlock } from './banano-change';
import { generateSendAssetBlock } from './send';
import {validateMintBlock } from "../block-validators/mint-block";
import { IMintBlock } from "../interfaces/mint-block";

// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/mint_blocks.md
export const generateMintAndSendBlock = (metadataRepresentative: TAccount, sender: TAccount, recipient: TAccount, previous: string, balanceRaw: bigint) => {
  const mintBlock = generateSendAssetBlock(metadataRepresentative, sender, recipient, previous, balanceRaw);
  mintBlock.subtype = "send";
  validateMintBlock(mintBlock as IMintBlock);
  return mintBlock;
}

export const generateMintAndKeepBlock = (metadataRepresentative: TAccount, minterAccount: TAccount, previous: TBlockHash, balance: bigint) => {
  const mintBlock = generateBananoChangeBlock(minterAccount, metadataRepresentative, previous, balance);
  mintBlock.subtype = "change";
  validateMintBlock(mintBlock as IMintBlock);
  return mintBlock;
}
