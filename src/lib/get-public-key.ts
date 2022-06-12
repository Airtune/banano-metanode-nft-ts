import * as bananojs from "@bananocoin/bananojs";
import { PRIVATE_KEY_PATTERN } from '../constants';
import { TPrivateKey, TPublicKey } from "../types/banano";

export const getPublicKey = async (privateKey: TPrivateKey): Promise<TPublicKey> => {
  try {
    if (privateKey.match(PRIVATE_KEY_PATTERN)) {
      return await bananojs.getPublicKey(privateKey) as TPublicKey;
    } else {
      throw Error(`ArgumentError: Unexpected format for private key: ${("" + privateKey).slice(0, 5) + "..."}`);
    }
  } catch(error) {
    throw(error);
  }
}

export const safeGetPublicKey = async (privateKey: TPrivateKey): Promise<TPublicKey> => {
  try {
    return await getPublicKey(privateKey);
  } catch (error) {
    return undefined;
  }
}

