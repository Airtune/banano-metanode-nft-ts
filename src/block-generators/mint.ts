import * as bananojs from '@bananocoin/bananojs';
import { generateBananoSendBlock } from './banano-send';
import { getAccountInfo } from '../lib/get-account-info';
import { generateSendAssetBlock } from './send';


// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/mint_blocks.md
export const generateMintAndSendBlock = async (metadataRepresentative: string, sender: string, recipient: string) => {

  //The following implements the send block creation. Still need to implement the mint (changesupply & change#mintassets)
  const sendblock = await generateSendAssetBlock(metadataRepresentative, sender, recipient);
  const mintblock = null;
  return [sendblock, mintblock];

  const sendRaw = "1";
  const representative = metadataRepresentative;
  const recipientPublicKey = bananojs.getAccountPublicKey(recipient);
  const balance = BigInt(balanceRaw) - BigInt(sendRaw);
  const work = await bananojs.bananodeApi.getGeneratedWork(previous);

  return generateBananoSendBlock(BigInt("1"), representative, sender, recipient);

  return {
    "type": "state",
    "account": sender,
    "previous": previous,
    "representative": representative,
    "balance": balance,
    "link": recipientPublicKey,
    "work": work
  }
}

export const generateMintAndKeepBlock = (metadataRepresentative: string) => {

}
