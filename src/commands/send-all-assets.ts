import { AccountCache } from "../account-cache";
import { generateSendAssetBlock } from "../block-generators/send";
import { generateSendAllAssetsBlock } from "../block-generators/send-all-assets";
import { SEND_ALL_NFTS_REPRESENTATIVE } from "../constants";
import { IBananoSend } from "../interfaces/banano-send";
import { generateSignature } from "../lib/generate-signature";
import { generateWork } from "../lib/generate-work";
import { processBlock } from "../lib/process-block";
import { TAccount, TBlockHash } from "../types/banano";

// Create send#asset block and process it on the Banano network.
export const sendAllAssetsCmd = async (accountCache: AccountCache, recipient: TAccount): Promise<TBlockHash> => {
  const previous: TBlockHash = await accountCache.getFrontier();
  const balanceRaw: bigint = await accountCache.getBalance();
  const workPromise: Promise<string> = generateWork(previous);

  // guard
  if (accountCache.accountState === "supply_awaiting_mint") {
    throw Error("CmdError: Unexpected send. Following a supply block, you must either make the first mint or cancel the supply block");
  }

  const block: IBananoSend = generateSendAllAssetsBlock(accountCache.account, recipient, previous, balanceRaw);

  block.signature = await generateSignature(accountCache.privateKey, block);
  block.work      = await workPromise;

  // TODO: Validate it locally first before processing on-chain
  const blockHash = await processBlock(block, "send", "send#asset");
  accountCache.updateInfo(blockHash, balanceRaw - BigInt(1), "ready", SEND_ALL_NFTS_REPRESENTATIVE);
  return blockHash;
};
