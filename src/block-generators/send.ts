import * as bananojs from '@bananocoin/bananojs';
import { generateBananoSendBlock } from './banano-send';
import { getAccountInfo } from '../lib/get-account-info';
import { IBananoSend } from '../interfaces/banano-send';


// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/send_and_receive_assets.md 
export const generateSendAssetBlock = (assetRepresentative: string, sender: string, recipient: string, previous: string, balanceRaw: bigint): IBananoSend => {
    const sendRaw: bigint = BigInt("1");
    const representative: string = assetRepresentative;

    return generateBananoSendBlock(sender, recipient, sendRaw, previous, BigInt(balanceRaw), representative);
}
