import * as bananojs from '@bananocoin/bananojs';

import { ATOMIC_SWAP_HEADER } from "../constants";
import { toFixedLengthPositiveHex } from "../lib/to-fixed-length-positive-hex";

// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md
export const generateSendAtomicSwapRepresentative = (assetHeight: bigint, receiveHeight: bigint, minRaw: bigint) => {
  const assetHeightHex   = toFixedLengthPositiveHex(assetHeight, 10);
  const receiveHeightHex = toFixedLengthPositiveHex(receiveHeight, 10);
  const minRawHex        = toFixedLengthPositiveHex(minRaw, 31);

  const atomicSwapRepresentativeHex = `${ATOMIC_SWAP_HEADER}${assetHeightHex}${receiveHeightHex}${minRawHex}`;
  const atomicSwapRepresentative = bananojs.getBananoAccount(atomicSwapRepresentativeHex);

  return atomicSwapRepresentative;
}

export const generateSendAtomicSwapBlock = async (sender: string, previous: string, recipient: string, assetHeight: bigint, receiveHeight: bigint, minRaw: bigint) => {
  const atomicSwapRepresentative = generateSendAtomicSwapRepresentative(assetHeight, receiveHeight, minRaw);
  const recipientPublicKey = bananojs.getAccountPublicKey(recipient);
  const work = await bananojs.bananodeApi.getGeneratedWork(previous);

  return {
    "type": "state",
    "account": sender,
    "previous": previous,
    "representative": atomicSwapRepresentative,
    "link": recipientPublicKey,
    "work": work
  }
}

export const generateReceiveAtomicSwapBlock = async() => {

}

export const generateAbortReceiveAtomicSwapBlock = async() => {

}

export const generateAbortPaymentBlock = async() => {
  
}