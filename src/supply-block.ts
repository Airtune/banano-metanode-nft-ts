import * as bananojs from '@bananocoin/bananojs';
import { nftSupplyHexPattern } from "./constants";

export function parseSupplyRepresentative(representative): { version: string, maxSupply: BigInt } {
  const nftSupplyHex = bananojs.getAccountPublicKey(representative);
  const match = nftSupplyHex.match(nftSupplyHexPattern);
  const major: BigInt = BigInt(`0x${match.groups.major}`);
  const minor: BigInt = BigInt(`0x${match.groups.minor}`);
  const patch: BigInt = BigInt(`0x${match.groups.patch}`);

  const version = `${major}.${minor}.${patch}`;
  const maxSupply = BigInt(`0x${match.groups.maxSupply}`);
  
  return {
    version: version,
    maxSupply: maxSupply
  }
}
