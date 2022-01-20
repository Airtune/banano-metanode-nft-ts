import { TBlockHash } from "../types/banano";
import { IBananoBlock } from "./banano-block";

export interface IBananoReceive extends IBananoBlock {
  link: TBlockHash
};
