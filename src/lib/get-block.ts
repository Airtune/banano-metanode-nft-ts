import { INanoAccountHistory, INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { bananode } from "../bananode";
import { TAccount } from "../types/banano";

export const getBlock = async (account: TAccount, hash: string): Promise<INanoBlock|undefined> => {
  // "block_info" RPC returns different data format than "account_history" RPC so even though
  // it's info for a single block, in some cases the "account_history" RPC is favored with count set to 1.
  const accountHistory: INanoAccountHistory = await bananode.getBackwardHistory(account, hash, undefined, undefined, 1);
  const block: INanoBlock = accountHistory.history[0];

  return block;
};
