import { ATOMIC_SWAP_HEX_PATTERN, ATOMIC_SWAP_DELEGATION_HEX_PATTERN } from "../constants";
import { IAtomicSwapConditions } from '../interfaces/atomic-swap-conditions';
import { getBananoAccountPublicKey } from "../lib/get-banano-account-public-key";
import { TAccount } from "../types/banano";

export function parseAtomicSwapRepresentative(representative: TAccount, delegation: boolean = false): (undefined|IAtomicSwapConditions) {
  const atomicSwapHex = getBananoAccountPublicKey(representative);
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
