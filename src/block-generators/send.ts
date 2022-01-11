import * as bananojs from '@bananocoin/bananojs';
import { generateBananoSendBlock } from './banano-send';
import { getAccountInfo } from '../lib/get-account-info';
import { IBananoSend } from '../interfaces/banano-send';


// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/send_and_receive_assets.md 
export const generateSendAssetBlock = async (assetRepresentative: string, sender: string, recipient: string): Promise<IBananoSend> => {
    const sendRaw: string = "1";
    const representative: string = assetRepresentative;
    const accountInfo = await getAccountInfo(sender);
    if (accountInfo == undefined) {
        throw Error(`Can't retrieve account information.`);
    }
    if (accountInfo.error) {
        throw Error(`NanoRPCError: ${accountInfo.error}`);
    }
    const balanceRaw: string = accountInfo.balance;
    if (BigInt(balanceRaw) < BigInt(sendRaw)) {
        throw Error(`Acount balance is too small.`);
    }
    const previous: string = accountInfo.frontier;

    return generateBananoSendBlock(sender, recipient, BigInt(sendRaw), previous, BigInt(balanceRaw), representative);

}
