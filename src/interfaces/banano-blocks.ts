export interface IBananoSend {
  type: "state",
  account: string,
  previous: string,
  representative: string,
  balance: bigint,
  link: string
};

export interface IBananoReceive {
  type: "state",
  account: string,
  previous: string,
  representative: string,
  balance: bigint,
  link: string
};

export interface IBananoChange {
  type: "state",
  account: string,
  previous: string,
  representative: string,
  balance: bigint,
  link: "0000000000000000000000000000000000000000000000000000000000000000"
};
