import { generateBananoSendBlock } from './banano-send';
import { IBananoSend } from '../interfaces/banano-send';
import { TAccount, TBlockHash } from "../types/banano";
import { SEND_ALL_NFTS_REPRESENTATIVE } from '../constants';


// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/send_and_receive_assets.md 
export const generateSendAllAssetsBlock = (sender: TAccount, recipient: TAccount, previous: TBlockHash, balanceRaw: bigint): IBananoSend => {
  const sendRaw: bigint = BigInt("1");

  return generateBananoSendBlock(sender, recipient, sendRaw, previous, BigInt(balanceRaw), SEND_ALL_NFTS_REPRESENTATIVE);
}
