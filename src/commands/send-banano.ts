import { AccountCache } from "../account-cache";
import { generateBananoSendBlock } from "../block-generators/banano-send";
import { IBananoSend } from "../interfaces/banano-send";
import { generateSignature } from "../lib/generate-signature";
import { generateWork } from "../lib/generate-work";
import { processBlock } from "../lib/process-block";
import { TAccount, TBlockHash } from "../types/banano";

export const sendBananoCmd = async (accountCache: AccountCache, representative: TAccount, recipient: TAccount, amountRaw: bigint): Promise<TBlockHash> => {
  const previous: TBlockHash = await accountCache.getFrontier();
  const balanceRaw: bigint = await accountCache.getBalance();
  const workPromise: Promise<string> = generateWork(previous);

  // guard
  if (accountCache.accountState === "supply_awaiting_mint") {
    throw Error("CmdError: Unexpected send. Following a supply block, you must either make the first mint or cancel the supply block");
  }

  const block: IBananoSend = generateBananoSendBlock(accountCache.account, recipient, amountRaw, previous, balanceRaw, representative);

  block.signature = await generateSignature(accountCache.privateKey, block);
  block.work      = await workPromise;

  const blockHash = await processBlock(block, "send", "send Banano");
  // TODO: Calculate new accountState and representative. Validate it isn't cancelling atomic swaps.
  accountCache.updateInfo(blockHash, balanceRaw - amountRaw, accountCache.accountState, await accountCache.getRepresentative());
  return blockHash;
};
