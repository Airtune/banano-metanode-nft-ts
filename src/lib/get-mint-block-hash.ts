import { TAccount, TBlockHash } from "../types/banano"
import { getBananoAccountPublicKey } from "./get-banano-account-public-key"

export const getMintBlockHash = (assetRepresentative: TAccount) => {
  return getBananoAccountPublicKey(assetRepresentative);
}
