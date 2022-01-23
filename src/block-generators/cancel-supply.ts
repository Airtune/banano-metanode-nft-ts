import { CANCEL_SUPPLY_REPRESENTATIVE } from "../constants"
import { TAccount } from "../types/banano";
import { generateBananoChangeBlock } from "./banano-change";

// Specification:
// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/supply_block.md
export const generateCancelSupplyBlock = (account: TAccount, previous: string, balanceRaw: bigint) => {
  return generateBananoChangeBlock(account, CANCEL_SUPPLY_REPRESENTATIVE, previous, balanceRaw);
}
