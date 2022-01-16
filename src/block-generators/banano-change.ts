import { IBananoChange } from "../interfaces/banano-change"
import { validateChangeBlockFormat } from "../block-validators/banano-change";
import { TAccount, TBlockHash } from "../types/banano";

// generate a change block without work, and signature
export const generateBananoChangeBlock = (account: TAccount, representative: TAccount, previous: TBlockHash, balanceRaw: bigint): IBananoChange => {
  const block: IBananoChange = {
    "type": "state",
    "account": account,
    "previous": previous,
    "representative": representative,
    "balance": balanceRaw,
    "link": "0000000000000000000000000000000000000000000000000000000000000000"
  }

  validateChangeBlockFormat(block);

  return block;
}
