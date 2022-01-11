import * as bananojs from '@bananocoin/bananojs';
import { ATOMIC_SWAP_HEX_PATTERN, ATOMIC_SWAP_DELEGATION_HEX_PATTERN } from "../constants";
import { IAtomicSwapConditions } from '../interfaces/atomic-swap-conditions';

export function parseAtomicSwapRepresentative(representative, delegation: boolean = false): (undefined|IAtomicSwapConditions) {
  const atomicSwapHex = bananojs.getAccountPublicKey(representative);
  const hexPattern = delegation ? ATOMIC_SWAP_DELEGATION_HEX_PATTERN : ATOMIC_SWAP_HEX_PATTERN;
  const match = atomicSwapHex.match(hexPattern);
  
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
