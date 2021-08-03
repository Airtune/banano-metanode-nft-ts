export interface INanoBlock {
  type: string;
  subtype: string;
  account: string;
  representative: string;
  previous: string;
  hash: string;
  link: string;
  height: string;
}

export interface INanoAccountHistory {
  account: string;
  history: INanoBlock[]
}

export interface INanoAccountInfo {
  confirmation_height: string;
}

export interface INanoAccountForwardIterable extends AsyncIterable<INanoBlock> {
  firstBlock: () => INanoBlock;
}

export interface INanoAccountBackwardIterable extends AsyncIterable<INanoBlock> {}

