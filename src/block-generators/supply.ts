import {
  META_PROTOCOL_MAJOR,
  META_PROTOCOL_MINOR,
  META_PROTOCOL_PATCH,
  SUPPLY_HEX_HEADER
} from "../constants"

import { toFixedLengthPositiveHex } from "../lib/to-fixed-length-positive-hex"
import { generateBananoChangeBlock } from "./banano-change";

// Specification:
// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/supply_block.md
export const generateSupplyBlock = (account: string, previous: string, balance: string, maxSupply: bigint) => {
  const supplyRepresentative = generateSupplyRepresentative(maxSupply);

  return generateBananoChangeBlock(account, supplyRepresentative, previous, balance);
}

// Specification:
// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/supply_block.md#supply_representative
export const generateSupplyRepresentative = (maxSupply: bigint) => {
  const majorHex = toFixedLengthPositiveHex(META_PROTOCOL_MAJOR, 10);
  const minorHex = toFixedLengthPositiveHex(META_PROTOCOL_MINOR, 10);
  const patchHex = toFixedLengthPositiveHex(META_PROTOCOL_PATCH, 10);
  const maxSupplyHex = toFixedLengthPositiveHex(maxSupply, 16);

  return `${SUPPLY_HEX_HEADER}${majorHex}${minorHex}${patchHex}${maxSupplyHex}`;
}

