import { ATOMIC_SWAP_DELEGATION_HEADER, ATOMIC_SWAP_HEADER } from "../constants";
import { findBlockAtHeight } from '../lib/find-block-at-height';
import { getBananoAccount } from "../lib/get-banano-account";
import { getBananoAccountPublicKey } from "../lib/get-banano-account-public-key";
import { toFixedLengthPositiveHex } from "../lib/to-fixed-length-positive-hex";
import { TAccount } from "../types/banano";

// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md
export const generateSendAtomicSwapRepresentative = (assetHeight: bigint, receiveHeight: bigint, minRaw: bigint, delegation: boolean = false) => {
  const assetHeightHex   = toFixedLengthPositiveHex(assetHeight, 10);
  const receiveHeightHex = toFixedLengthPositiveHex(receiveHeight, 10);
  const minRawHex        = toFixedLengthPositiveHex(minRaw, 31);
  const header: string   = delegation ? ATOMIC_SWAP_DELEGATION_HEADER : ATOMIC_SWAP_HEADER;

  const atomicSwapRepresentativeHex = `${header}${assetHeightHex}${receiveHeightHex}${minRawHex}`;
  const atomicSwapRepresentative = getBananoAccount(atomicSwapRepresentativeHex);

  return atomicSwapRepresentative;
}

export const generateSendAtomicSwapBlock = async (sender: string, previous: string, recipient: TAccount, assetHeight: bigint, receiveHeight: bigint, minRaw: bigint, delegation: boolean = false) => {
  const atomicSwapRepresentative = generateSendAtomicSwapRepresentative(assetHeight, receiveHeight, minRaw, delegation);
  const recipientPublicKey = getBananoAccountPublicKey(recipient);

  return {
    "type": "state",
    "account": sender,
    "previous": previous,
    "representative": atomicSwapRepresentative,
    "link": recipientPublicKey
  }
}

export const generateReceiveAtomicSwapBlock = async (account: string, sendAtomicSwapBlockHash, receiveHeight: bigint) => {
  const previousHeight: bigint = receiveHeight - BigInt("1");
  const previousBlock = await findBlockAtHeight(account, previousHeight);
  return {
    "type": "state",
    "account": account,
    "previous": previousBlock.hash,
    "representative": previousBlock.representative, // changing representative here cancels the atomic swap
    "link": sendAtomicSwapBlockHash
  }
}

export const generateAbortReceiveAtomicSwapBlock = async() => {

}

export const generateAbortPaymentBlock = async() => {
  
}