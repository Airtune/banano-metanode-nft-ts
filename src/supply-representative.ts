import * as bananojs from '@bananocoin/bananojs';
import { SUPPLY_HEX_PATTERN, FINISH_SUPPLY_HEX_PATTERN } from "./constants";

export function parseSupplyRepresentative(representative): { version: string, maxSupply: bigint } {
  const supplyHex = bananojs.getAccountPublicKey(representative);
  const match = supplyHex.match(SUPPLY_HEX_PATTERN);
  if (!match) { return undefined; }

  const major: bigint = BigInt(`0x${match.groups.major}`);
  const minor: bigint = BigInt(`0x${match.groups.minor}`);
  const patch: bigint = BigInt(`0x${match.groups.patch}`);

  const version: string = `${major}.${minor}.${patch}`;
  const maxSupply: bigint = BigInt(`0x${match.groups.maxSupply}`);
  
  return {
    version: version,
    maxSupply: maxSupply
  }
}

export function parseFinishSupplyRepresentative(representative): { supplyBlockHeight: bigint } {
  const finishSupplyHex = bananojs.getAccountPublicKey(representative);
  const match = finishSupplyHex.match(FINISH_SUPPLY_HEX_PATTERN);
  if (!match) { return undefined; }

  return { supplyBlockHeight: BigInt(`0x${match.groups.supplyBlockHeight}`) }
}
