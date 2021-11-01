import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { cancelRepresentative } from "./constants";

export function isCancelSupplyBlock(block: INanoBlock) {
  return block.representative == cancelRepresentative;
}
