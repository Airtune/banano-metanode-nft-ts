import { IBananoChange } from "../interfaces/banano-change"
import { validateChangeBlockFormat } from "../block-validators/banano-change";

// generate a change block without hash, work, and signature
export const generateBananoChangeBlock = (account: string, representative: string, previous: string, balanceRaw: bigint): IBananoChange => {
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
