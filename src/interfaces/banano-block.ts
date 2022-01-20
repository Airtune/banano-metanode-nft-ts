import { TAccount, TBlockHash } from "../types/banano";

export interface IBananoBlock {
  type: "state",
  account: TAccount,
  previous: TBlockHash,
  representative: TAccount,
  balance: bigint,
  link: TBlockHash,
  signature?: string | undefined;
  work?: string | undefined;
};


export interface ISignedBananoBlock extends IBananoBlock {
  signature: string | undefined;
};
