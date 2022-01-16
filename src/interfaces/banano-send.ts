import { TPublicKey } from "../types/banano";
import { IBananoBlock } from "./banano-block";

export interface IBananoSend extends IBananoBlock {
  link: TPublicKey
};
