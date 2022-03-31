import { INanoAccountInfo } from "nano-account-crawler/dist/nano-interfaces";
import { AccountCache } from "../account-cache";
import { AssetCrawler } from "../asset-crawler";
import { generateSendAtomicSwapBlock } from "../block-generators/send-atomic-swap";
import { IAssetBlock } from "../interfaces/asset-block";
import { IBananoSend } from "../interfaces/banano-send";
import { generateSignature } from "../lib/generate-signature";
import { generateWork } from "../lib/generate-work";
import { getAccountInfo } from "../lib/get-account-info";
import { processBlock } from "../lib/process-block";
import { TAccount, TBlockHash } from "../types/banano";

// Create send#asset block and process it on the Banano network.
export const sendAtomicSwapCmd = async (assetCrawler: AssetCrawler, accountCache: AccountCache, recipient: TAccount, minRaw: bigint): Promise<TBlockHash> => {
  const previous: TBlockHash = await accountCache.getFrontier();
  const workPromise: Promise<string> = generateWork(previous);
  const previousBalanceRaw: bigint = await accountCache.getBalance();

  // Find info about swap asset
  const assetFrontierBlock: IAssetBlock = assetCrawler.frontier;
  const assetHeight: bigint = BigInt(assetFrontierBlock.nanoBlock.height);

  // Find info about swap recipient account
  const recipientAccountInfo: INanoAccountInfo = await getAccountInfo(recipient);
  const receiveHeight: bigint = BigInt(recipientAccountInfo.confirmation_height) + BigInt("1");
  const recipientBalance: bigint = BigInt(recipientAccountInfo.balance);

  // guards
  if (accountCache.accountState === "supply_awaiting_mint") {
    // Not strictly neccassary but helps with avoiding dead supply blocks.
    throw Error("CmdError: Unexpected sendAtomicSwap. Following a supply block, make the first mint.");
  }
  if (receiveHeight <= 1) {
    throw Error(`InvalidSwapError: Receiving account "${recipient}" must be open before you can send an atomic swap`);
  }
  if (recipientBalance < minRaw) {
    throw Error(`InvalidSwapError: Receiving account "${recipient}" must hold more than minRaw before initiating swap`);
  }

  const delegated: boolean = false;
  const block: IBananoSend = await generateSendAtomicSwapBlock(accountCache.account, previous, recipient, assetHeight, receiveHeight, previousBalanceRaw, minRaw, delegated);

  block.signature = await generateSignature(accountCache.privateKey, block);
  block.work      = await workPromise;

  // TODO: Validate it locally first before processing on-chain
  const blockHash = await processBlock(block, "send", "send#atomic_swap");
  return blockHash;
};
