export interface IBananoSend {
  type: "state",
  account: string,
  previous: string,
  representative: string,
  balance: bigint,
  link: string
};
