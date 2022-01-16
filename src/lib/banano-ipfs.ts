import * as bananojs from "@bananocoin/bananojs";
import { NanoIpfs } from 'nano-ipfs';

const publicKeyToAccount = (publicKey) => {
  return bananojs.bananoUtil.getAccount(publicKey, 'ban_');
};
const accountToPublicKey = bananojs.bananoUtil.getAccountPublicKey;
export const bananoIpfs = new NanoIpfs(publicKeyToAccount, accountToPublicKey);
