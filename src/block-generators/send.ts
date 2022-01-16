import { generateBananoSendBlock } from './banano-send';
import { IBananoSend } from '../interfaces/banano-send';
import { TAccount, TBlockHash } from "../types/banano";


// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/send_and_receive_assets.md 
export const generateSendAssetBlock = (assetRepresentative: TAccount, sender: TAccount, recipient: TAccount, previous: TBlockHash, balanceRaw: bigint): IBananoSend => {
  const sendRaw: bigint = BigInt("1");

  return generateBananoSendBlock(sender, recipient, sendRaw, previous, BigInt(balanceRaw), assetRepresentative);
}
