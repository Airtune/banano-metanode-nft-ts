import * as bananojs from '@bananocoin/bananojs';
import { ADDRESS_PATTERN, PUBLIC_KEY_PATTERN } from '../constants';

export const getPublicKey = (addressOrPublicKey: string) => {
  if (addressOrPublicKey.match(ADDRESS_PATTERN)) {
    return bananojs.getAccountPublicKey(addressOrPublicKey);
  } else if (addressOrPublicKey.match(PUBLIC_KEY_PATTERN)) {
    return addressOrPublicKey;
  } else {
    throw Error(`ArgumentError: Unexpected format for address or public key: ${addressOrPublicKey}`);
  }
}
