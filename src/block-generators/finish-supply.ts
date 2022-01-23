import { FINISH_SUPPLY_HEX_HEADER } from "../constants"
import { getBananoAccount } from "../lib/get-banano-account";

import { toFixedLengthPositiveHex } from "../lib/to-fixed-length-positive-hex"
import { TAccount } from "../types/banano";
import { generateBananoChangeBlock } from "./banano-change";

// Specification:
// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/supply_block.md#finish_supply-block
export const generateFinishSupplyBlock = (account: TAccount, previous: string, balanceRaw: bigint, supplyBlockHeight: bigint) => {
  const finishSupplyRepresentative = generateFinishSupplyRepresentative(supplyBlockHeight);

  return generateBananoChangeBlock(account, finishSupplyRepresentative, previous, balanceRaw);
}

export const generateFinishSupplyRepresentative = (supplyBlockHeight: bigint): TAccount => {
  const supplyBlockHeightHex = toFixedLengthPositiveHex(supplyBlockHeight, 40);
  const representative = getBananoAccount(`${FINISH_SUPPLY_HEX_HEADER}${supplyBlockHeightHex}`);
  return representative;
}

