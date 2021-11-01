import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";

export interface IMetaBlock {
  type: string,
  account: string,
  nanoBlock: INanoBlock
}
