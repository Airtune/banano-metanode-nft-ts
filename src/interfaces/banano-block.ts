export interface IBananoBlock {
  type: "state",
  account: string,
  previous: string,
  representative: string,
  balance: bigint,
  link: string,
  signature?: string | undefined;
  work?: string | undefined;
};
