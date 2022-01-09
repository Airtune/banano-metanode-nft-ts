import * as bananojs from '@bananocoin/bananojs';
import { generateBananoSendBlock } from './banano-send';
import { getAccountInfo } from '../lib/get-account-info';


// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/send_and_receive_assets.md 
export const generateSendAssetBlock = async (assetRepresentative: string, sender: string, recipient: string) => {
    const sendRaw = "1";
    const representative = assetRepresentative;
    const accountInfo = await getAccountInfo(sender);
    if (accountInfo == undefined) {
        throw Error(`Can't retrieve account information.`);
    }
    const balanceRaw = accountInfo.balance;
    if (BigInt(balanceRaw) < BigInt(sendRaw)) {
        throw Error(`Acount balance is too small.`);
    }
    const previous = accountInfo.frontier;

    return generateBananoSendBlock(sender, recipient, BigInt(sendRaw), previous, balanceRaw, representative);

}
