import * as bananojs from '@bananocoin/bananojs';
import { generateBananoSendBlock } from './banano-send';

export const generateMintAndSendBlock = async (metadataRepresentative: string, sender: string, recipient: string) => {
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
