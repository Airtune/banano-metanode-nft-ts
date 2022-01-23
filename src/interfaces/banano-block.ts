import { TAccount, TBlockHash } from "../types/banano";

export interface IBananoBlock {
  type: "state",
  subtype?: "open" | "receive" | "send" | "change" | "epoch",
  account: TAccount,
  previous: TBlockHash,
  representative: TAccount,
  balance: bigint,
  link: TBlockHash,
  signature?: string | undefined,
  work?: string | undefined,
  hash?: TBlockHash
};

export interface ISignedBananoBlock extends IBananoBlock {
  signature: string | undefined
};
