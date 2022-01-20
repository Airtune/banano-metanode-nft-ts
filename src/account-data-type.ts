// types
import { TAccount } from "./types/banano";

// src
import {
  ATOMIC_SWAP_DELEGATION_HEX_PATTERN,
  ATOMIC_SWAP_HEX_PATTERN,
  BURN_ACCOUNTS,
  CANCEL_SUPPLY_REPRESENTATIVE,
  FINISH_SUPPLY_HEX_PATTERN,
  SUPPLY_HEX_PATTERN
} from "./constants";
import { getBananoAccountPublicKey } from "./lib/get-banano-account-public-key";

export const accountDataType = (account: TAccount): string => {
  // Match against special case accounts
  if (account === CANCEL_SUPPLY_REPRESENTATIVE) {
    return "cancel_supply_representative";
  }
  if (BURN_ACCOUNTS.includes(account)) {
    return "burn";
  }

  // Match against hex patterns for encoded data.
  const publicKeyHex = getBananoAccountPublicKey(account);
  if (publicKeyHex.match(SUPPLY_HEX_PATTERN)) {
    return "supply";
  }
  if (publicKeyHex.match(FINISH_SUPPLY_HEX_PATTERN)) {
    return "finish_supply";
  }
  if (publicKeyHex.match(ATOMIC_SWAP_HEX_PATTERN)) {
    return "atomic_swap";
  }
  if (publicKeyHex.match(ATOMIC_SWAP_DELEGATION_HEX_PATTERN)) {
    return "atomic_swap_delegation";
  }

  return "unknown";
}