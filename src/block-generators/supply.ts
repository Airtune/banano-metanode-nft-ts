import {
  META_PROTOCOL_MAJOR,
  META_PROTOCOL_MINOR,
  META_PROTOCOL_PATCH,
  SUPPLY_HEX_HEADER
} from "../constants"
import { getBananoAccount } from "../lib/get-banano-account";

import { toFixedLengthPositiveHex } from "../lib/to-fixed-length-positive-hex"
import { TAccount } from "../types/banano";
import { generateBananoChangeBlock } from "./banano-change";

// Specification:
// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/supply_block.md
export const generateSupplyBlock = (account: TAccount, previous: string, balanceRaw: bigint, maxSupply: bigint) => {
  const supplyRepresentative = generateSupplyRepresentative(maxSupply);

  return generateBananoChangeBlock(account, supplyRepresentative, previous, balanceRaw);
}

// Specification:
// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/supply_block.md#supply_representative
export const generateSupplyRepresentative = (maxSupply: bigint): TAccount => {
  const majorHex = toFixedLengthPositiveHex(META_PROTOCOL_MAJOR, 10);
  const minorHex = toFixedLengthPositiveHex(META_PROTOCOL_MINOR, 10);
  const patchHex = toFixedLengthPositiveHex(META_PROTOCOL_PATCH, 10);
  const maxSupplyHex = toFixedLengthPositiveHex(maxSupply, 16);
  const representative = getBananoAccount(`${SUPPLY_HEX_HEADER}${majorHex}${minorHex}${patchHex}${maxSupplyHex}`);
  return representative;
}

