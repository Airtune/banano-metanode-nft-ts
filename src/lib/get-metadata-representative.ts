// types
import { TAccount, TBlockHash } from "../types/banano"

// src
import { bananoIpfs } from "./banano-ipfs";

// Takes an ipfsCID for the NFT Metadata JSON and returns a Banano representative used to mint NFTs.
export const getMetadataRepresentative = (ipfsCID: string): TAccount => {
  const metadataRepresentative: TAccount = bananoIpfs.ifpsCidV0ToAccount(ipfsCID) as TAccount;
  return metadataRepresentative;
}
