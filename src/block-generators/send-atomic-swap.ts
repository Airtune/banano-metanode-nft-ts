import { ATOMIC_SWAP_DELEGATION_HEADER, ATOMIC_SWAP_HEADER } from "../constants";
import { IBananoSend } from "../interfaces/banano-send";
import { findBlockAtHeight } from '../lib/find-block-at-height';
import { getBananoAccount } from "../lib/get-banano-account";
import { getBananoAccountPublicKey } from "../lib/get-banano-account-public-key";
import { toFixedLengthPositiveHex } from "../lib/to-fixed-length-positive-hex";
import { TAccount, TBlockHash } from "../types/banano";
import { generateBananoSendBlock } from "./banano-send";

// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md
export const generateSendAtomicSwapRepresentative = (assetHeight: bigint, receiveHeight: bigint, minRaw: bigint, delegation: boolean = false) => {
  if (receiveHeight <= 1) {
    throw Error(`send#atomic_swap representative is invalid. Must be above 1. Got: ${receiveHeight}`);
  }
  const assetHeightHex   = toFixedLengthPositiveHex(assetHeight, 10);
  const receiveHeightHex = toFixedLengthPositiveHex(receiveHeight, 10);
  const minRawHex        = toFixedLengthPositiveHex(minRaw, 31);
  const header: string   = delegation ? ATOMIC_SWAP_DELEGATION_HEADER : ATOMIC_SWAP_HEADER;

  const atomicSwapRepresentativeHex = `${header}${assetHeightHex}${receiveHeightHex}${minRawHex}`;
  const atomicSwapRepresentative = getBananoAccount(atomicSwapRepresentativeHex);

  return atomicSwapRepresentative;
}

export const generateSendAtomicSwapBlock = async (sender: TAccount, previous: TBlockHash, recipient: TAccount, assetHeight: bigint, receiveHeight: bigint, previousBalanceRaw: bigint, minRaw: bigint, delegation: boolean = false): Promise<IBananoSend> => {
  const atomicSwapRepresentative = generateSendAtomicSwapRepresentative(assetHeight, receiveHeight, minRaw, delegation);
  const block: IBananoSend = generateBananoSendBlock(sender, recipient, BigInt("1"), previous, previousBalanceRaw, atomicSwapRepresentative);
  return block;
}
