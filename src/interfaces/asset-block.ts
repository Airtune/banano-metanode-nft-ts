import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";

export type TAssetState = "ownership" | "send" | "pending_atomic_swap" | "pending_payment" | "cancel_atomic_swap" | "burned" | "pending_delegation" | "pending_delegation_payment";
export type TAssetBlockType = "change#mint" | "receive#mint" | "send#mint" | "send#asset" | "receive#asset" | "send#burn" | "send#atomic_swap" | "receive#atomic_swap" | "send#atomic_swap_delegation" | "receive#atomic_swap_delegation" | "send#cancel_atomic_swap" | "receive#cancel_atomic_swap" | "change#cancel_atomic_swap" | "send#payment";

export interface IAssetBlock {
  state: TAssetState,
  type: TAssetBlockType,
  account: string,
  owner: string,
  locked: boolean,
  nanoBlock: INanoBlock,
  traceLength: bigint
}
