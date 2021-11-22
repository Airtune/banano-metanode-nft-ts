import * as bananojs from '@bananocoin/bananojs';
import { ATOMIC_SWAP_HEX_PATTERN } from "../constants";
import { IAtomicSwapConditions } from '../interfaces/atomic-swap-conditions';

export function parseAtomicSwapRepresentative(representative): (undefined|IAtomicSwapConditions) {
  const atomicSwapHex = bananojs.getAccountPublicKey(representative);
  const match = atomicSwapHex.match(ATOMIC_SWAP_HEX_PATTERN);
  
  if (match) {
    return {
      assetHeight: BigInt(`0x${match.groups.assetHeight}`),
      receiveHeight: BigInt(`0x${match.groups.receiveHeight}`),
      minRaw: BigInt(`0x${match.groups.minRaw}`)
    };
  } else {
    return undefined;
  }
}
