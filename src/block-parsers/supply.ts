import * as bananojs from "@bananocoin/bananojs";
import { SUPPLY_HEX_PATTERN, FINISH_SUPPLY_HEX_PATTERN } from "../constants";
import { getBananoAccountPublicKey } from "../lib/get-banano-account-public-key";
import { TAccount } from "../types/banano";

export function parseSupplyRepresentative(representative: TAccount): { version: string, maxSupply: bigint } {
  const supplyHex = getBananoAccountPublicKey(representative);
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

export function parseFinishSupplyRepresentative(representative: TAccount): { supplyBlockHeight: bigint } {
  const finishSupplyHex = getBananoAccountPublicKey(representative);
  const match = finishSupplyHex.match(FINISH_SUPPLY_HEX_PATTERN);
  if (!match) { return undefined; }

  return { supplyBlockHeight: BigInt(`0x${match.groups.supplyBlockHeight}`) }
}
