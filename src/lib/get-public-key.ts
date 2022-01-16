import * as bananojs from "@bananocoin/bananojs";
import { PRIVATE_KEY_PATTERN } from '../constants';
import { TPrivateKey, TPublicKey } from "../types/banano";

export const getPublicKey = (privateKey: TPrivateKey): TPublicKey => {
  if (privateKey.match(PRIVATE_KEY_PATTERN)) {
    return bananojs.getPublicKey(privateKey) as TPublicKey;
  } else {
    throw Error(`ArgumentError: Unexpected format for private key: ${("" + privateKey).slice(0, 5) + "..."}`);
  }
}

export const safeGetPublicKey = (privateKey: TPrivateKey): TPublicKey => {
  try {
    return getPublicKey(privateKey);
  } catch (error) {
    return undefined;
  }
}

