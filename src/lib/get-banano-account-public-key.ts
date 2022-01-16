import { TAccount, TBlockHash, TPublicKey } from "../types/banano";
import * as bananojs from "@bananocoin/bananojs";

export const getBananoAccountPublicKey = (account: TAccount): TPublicKey => {
  return bananojs.getAccountPublicKey(account) as TPublicKey;
}
