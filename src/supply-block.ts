import * as bananojs from '@bananocoin/bananojs';
import { supplyHexPattern } from "./constants";

export function parseSupplyRepresentative(representative): { version: string, maxSupply: BigInt } {
  const supplyHex = bananojs.getAccountPublicKey(representative);
  const match = supplyHex.match(supplyHexPattern);
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
