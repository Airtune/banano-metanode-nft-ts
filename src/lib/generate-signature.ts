import * as bananojs from "@bananocoin/bananojs";
import { IBananoBlock } from "../interfaces/banano-block";

export const generateSignature = async (privateKey, block: IBananoBlock) => {
  const signature: string = await bananojs.getSignature(privateKey, block);
  return signature
};
