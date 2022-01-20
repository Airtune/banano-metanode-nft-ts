import { TAccount, TBlockHash } from "../types/banano"

import * as bananojs from "@bananocoin/bananojs";

const getAssetRepresentative = (mintBlockHash: TBlockHash): TAccount => {
  return bananojs.getBananoAccount(mintBlockHash) as TAccount; 
}
