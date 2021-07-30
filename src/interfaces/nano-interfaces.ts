export interface INanoBlock {
  account: string;
  representative: string;
  hash: string;
  height: string;
}

export interface INanoAccountHistory {
  account: string;
  history: INanoBlock[]
}

export interface INanoAccountInfo {
  confirmation_height: string;
}

export interface INanoAccountIterable extends AsyncIterable<INanoBlock> {
  account: string;
  firstBlock: () => INanoBlock;
}
