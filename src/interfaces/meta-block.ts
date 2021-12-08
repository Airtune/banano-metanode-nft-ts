import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";

export interface IMetaBlock {
  state: "ownership" | "send" | "send_atomic_swap" | "pending_atomic_swap" | "cancel_atomic_swap" | "burned",
  type: string,
  account: string,
  owner: string,
  locked: boolean,
  nanoBlock: INanoBlock,
  traceLength: bigint
}
