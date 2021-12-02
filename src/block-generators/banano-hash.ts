import { INanoBlock } from "nano-account-crawler/dist/nano-interfaces";

import * as bananojs from '@bananocoin/bananojs';

export const generateBananoBlockHash = (block: INanoBlock) => {
  return bananojs.generateBlockHash(block);
}
