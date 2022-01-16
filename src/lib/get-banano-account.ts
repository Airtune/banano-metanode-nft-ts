import * as bananojs from "@bananocoin/bananojs";
import { TAccount } from "../types/banano";

export const getBananoAccount = (publicKey): TAccount => {
  return bananojs.getBananoAccount(publicKey) as TAccount;
};
